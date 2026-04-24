from datetime import datetime

from pydantic import BaseModel


class CheckoutOut(BaseModel):
    url: str
    mocked: bool


class SubscriptionStatus(BaseModel):
    active: bool
    plan: str
    status: str
    current_period_end: datetime | None
    mocked: bool
