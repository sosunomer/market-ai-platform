from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config import settings
from app.db import get_db
from app.deps import get_current_user
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.subscription import CheckoutOut, SubscriptionStatus
from app.services import stripe_client

router = APIRouter(prefix="/api/subscriptions", tags=["subscriptions"])


@router.post("/checkout", response_model=CheckoutOut)
async def create_checkout(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CheckoutOut:
    url, mocked = await stripe_client.create_checkout_session(user.email, user.id)

    if mocked:
        # In mock mode, auto-activate the subscription so dev flows proceed.
        sub = db.query(Subscription).filter(Subscription.user_id == user.id).first()
        if not sub:
            sub = Subscription(user_id=user.id, provider="mock")
            db.add(sub)
        sub.status = "active"
        sub.external_id = f"mock_{user.id}"
        sub.current_period_end = stripe_client.mock_period_end()
        user.plan = "premium"
        db.commit()

    return CheckoutOut(url=url, mocked=mocked)


@router.get("/status", response_model=SubscriptionStatus)
def status(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SubscriptionStatus:
    sub = db.query(Subscription).filter(Subscription.user_id == user.id).first()
    mocked = not settings.has_stripe
    if not sub:
        return SubscriptionStatus(
            active=user.plan == "premium",
            plan=user.plan,
            status="none",
            current_period_end=None,
            mocked=mocked,
        )
    return SubscriptionStatus(
        active=sub.status == "active",
        plan=user.plan,
        status=sub.status,
        current_period_end=sub.current_period_end,
        mocked=mocked,
    )
