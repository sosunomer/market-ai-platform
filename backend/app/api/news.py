from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.instrument import Instrument
from app.services import finnhub_client

router = APIRouter(prefix="/api", tags=["news"])


@router.get("/instruments/{instrument_id}/news")
async def instrument_news(
    instrument_id: int,
    days: int = Query(default=14, ge=1, le=60),
    db: Session = Depends(get_db),
) -> list[dict]:
    inst = db.get(Instrument, instrument_id)
    if not inst:
        raise HTTPException(status_code=404, detail="Instrument not found")
    items = await finnhub_client.fetch_company_news(inst.symbol, days=days)
    return items
