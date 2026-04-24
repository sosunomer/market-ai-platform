from datetime import datetime

from pydantic import BaseModel


class NewsOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    source: str
    published_at: datetime
    title: str
    url: str
    summary: str
