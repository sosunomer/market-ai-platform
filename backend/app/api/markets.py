from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.instrument import Instrument
from app.models.market import Market
from app.schemas.market import InstrumentOut, MarketOut

router = APIRouter(prefix="/api", tags=["markets"])


@router.get("/markets", response_model=list[MarketOut])
def list_markets(db: Session = Depends(get_db)) -> list[MarketOut]:
    rows = db.query(Market).order_by(Market.code).all()
    return [MarketOut.model_validate(r) for r in rows]


@router.get("/markets/{market_id}/instruments", response_model=list[InstrumentOut])
def list_instruments(
    market_id: int,
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[InstrumentOut]:
    q = db.query(Instrument).filter(Instrument.market_id == market_id)
    if search:
        like = f"%{search.upper()}%"
        q = q.filter((Instrument.symbol.ilike(like)) | (Instrument.name.ilike(f"%{search}%")))
    rows = q.order_by(Instrument.symbol).limit(200).all()
    return [InstrumentOut.model_validate(r) for r in rows]


@router.get("/instruments/{instrument_id}", response_model=InstrumentOut)
def get_instrument(instrument_id: int, db: Session = Depends(get_db)) -> InstrumentOut:
    row = db.get(Instrument, instrument_id)
    if not row:
        raise HTTPException(status_code=404, detail="Instrument not found")
    return InstrumentOut.model_validate(row)


@router.get("/instruments", response_model=list[InstrumentOut])
def search_instruments(
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[InstrumentOut]:
    q = db.query(Instrument)
    if search:
        like = f"%{search.upper()}%"
        q = q.filter((Instrument.symbol.ilike(like)) | (Instrument.name.ilike(f"%{search}%")))
    rows = q.order_by(Instrument.symbol).limit(50).all()
    return [InstrumentOut.model_validate(r) for r in rows]
