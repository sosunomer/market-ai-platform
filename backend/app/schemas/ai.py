from pydantic import BaseModel, Field


class AIReportIn(BaseModel):
    instrument_id: int
    timeframe: str = Field(default="1M", pattern="^(1D|1W|1M|3M|1Y)$")
    mode: str = Field(default="short", pattern="^(short|long)$")


class AIReportOut(BaseModel):
    summary: str
    signals: dict
    sources: list[str]
    mocked: bool


class AIChatIn(BaseModel):
    instrument_id: int | None = None
    question: str = Field(min_length=2, max_length=1000)


class AIChatOut(BaseModel):
    answer: str
    mocked: bool
