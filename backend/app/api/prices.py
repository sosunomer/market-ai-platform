from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.instrument import Instrument
from app.schemas.price import Candle, Indicators, PriceSeries
from app.services import finnhub_client
from app.services import indicators as ind_service

router = APIRouter(prefix="/api", tags=["prices"])


ALLOWED_RANGES = {"1D", "1W", "1M", "3M", "1Y"}


@router.get("/instruments/{instrument_id}/prices", response_model=PriceSeries)
async def get_prices(
    instrument_id: int,
    range: str = Query(default="1M"),
    interval: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> PriceSeries:
    if range not in ALLOWED_RANGES:
        raise HTTPException(status_code=400, detail=f"Invalid range. Use one of {ALLOWED_RANGES}")
    inst = db.get(Instrument, instrument_id)
    if not inst:
        raise HTTPException(status_code=404, detail="Instrument not found")

    candles_raw, source = await finnhub_client.fetch_candles(inst.symbol, range, interval)
    candles = [Candle(**c) for c in candles_raw]
    return PriceSeries(
        instrument_id=inst.id,
        symbol=inst.symbol,
        interval=interval or "auto",
        range=range,
        candles=candles,
        source=source,
    )


@router.get("/instruments/{instrument_id}/indicators", response_model=Indicators)
async def get_indicators(
    instrument_id: int,
    range: str = Query(default="3M"),
    interval: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> Indicators:
    if range not in ALLOWED_RANGES:
        raise HTTPException(status_code=400, detail=f"Invalid range. Use one of {ALLOWED_RANGES}")
    inst = db.get(Instrument, instrument_id)
    if not inst:
        raise HTTPException(status_code=404, detail="Instrument not found")

    candles_raw, _ = await finnhub_client.fetch_candles(inst.symbol, range, interval)
    closes = [c["close"] for c in candles_raw]
    return Indicators(**ind_service.compute_all(closes))


@router.get("/instruments/{instrument_id}/quote")
async def get_quote(instrument_id: int, db: Session = Depends(get_db)) -> dict:
    inst = db.get(Instrument, instrument_id)
    if not inst:
        raise HTTPException(status_code=404, detail="Instrument not found")
    quote = await finnhub_client.fetch_quote(inst.symbol)
    return {"symbol": inst.symbol, "quote": quote}
