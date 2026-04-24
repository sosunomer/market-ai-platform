from pydantic import BaseModel


class MarketOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    code: str
    name: str
    country: str
    timezone: str
    kind: str


class InstrumentOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    symbol: str
    name: str
    market_id: int
    sector: str
    currency: str
    kind: str
