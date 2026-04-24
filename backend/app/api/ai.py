from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user, require_premium
from app.models.ai import AIReport, AIRequest
from app.models.instrument import Instrument
from app.models.user import User
from app.schemas.ai import AIChatIn, AIChatOut, AIReportIn, AIReportOut
from app.services import finnhub_client, llm
from app.services import indicators as ind_service

router = APIRouter(prefix="/api/ai", tags=["ai"])


# Free tier: 3 "short" reports/day. We don't enforce a strict count here yet — left as TODO.


@router.post("/report", response_model=AIReportOut)
async def create_report(
    payload: AIReportIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AIReportOut:
    inst = db.get(Instrument, payload.instrument_id)
    if not inst:
        raise HTTPException(status_code=404, detail="Instrument not found")

    if payload.mode == "long" and user.plan != "premium":
        raise HTTPException(status_code=402, detail="Long-term reports require premium plan")

    candles, _ = await finnhub_client.fetch_candles(inst.symbol, "3M")
    closes = [c["close"] for c in candles]
    signals = ind_service.latest_signal(closes)
    news = await finnhub_client.fetch_company_news(inst.symbol, days=14)

    summary, mocked = await llm.generate_report(inst.symbol, signals, news, mode=payload.mode)

    req = AIRequest(
        user_id=user.id,
        instrument_id=inst.id,
        timeframe=payload.timeframe,
        mode=payload.mode,
        question="",
    )
    db.add(req)
    db.flush()
    report = AIReport(
        ai_request_id=req.id,
        summary=summary,
        signals=signals,
        sources=[n.get("url", "") for n in news[:5] if n.get("url")],
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return AIReportOut(
        summary=summary,
        signals=signals,
        sources=report.sources,
        mocked=mocked,
    )


@router.post("/chat", response_model=AIChatOut)
async def chat(
    payload: AIChatIn,
    user: User = Depends(require_premium),
    db: Session = Depends(get_db),
) -> AIChatOut:
    symbol = None
    signals: dict | None = None
    if payload.instrument_id:
        inst = db.get(Instrument, payload.instrument_id)
        if not inst:
            raise HTTPException(status_code=404, detail="Instrument not found")
        symbol = inst.symbol
        candles, _ = await finnhub_client.fetch_candles(inst.symbol, "1M")
        signals = ind_service.latest_signal([c["close"] for c in candles])

    answer, mocked = await llm.answer_question(symbol, signals, payload.question)
    return AIChatOut(answer=answer, mocked=mocked)
