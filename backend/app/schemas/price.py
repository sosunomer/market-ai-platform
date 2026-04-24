from datetime import datetime

from pydantic import BaseModel


class Candle(BaseModel):
    ts: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int


class PriceSeries(BaseModel):
    instrument_id: int
    symbol: str
    interval: str
    range: str
    candles: list[Candle]
    source: str  # "finnhub" | "mock"


class Indicators(BaseModel):
    ma20: list[float | None]
    ma50: list[float | None]
    ma200: list[float | None]
    rsi14: list[float | None]
    macd: list[float | None]
    macd_signal: list[float | None]
    macd_hist: list[float | None]
