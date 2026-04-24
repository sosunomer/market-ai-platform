"""Stripe integration with mock fallback for local dev."""
from __future__ import annotations

from datetime import UTC, datetime, timedelta

from app.config import settings


async def create_checkout_session(user_email: str, user_id: int) -> tuple[str, bool]:
    if not settings.has_stripe:
        # Mock: pretend to redirect to success URL immediately
        return (f"{settings.stripe_success_url}?mock=1&uid={user_id}", True)
    import stripe

    stripe.api_key = settings.stripe_secret_key
    session = stripe.checkout.Session.create(
        mode="subscription",
        line_items=[{"price": settings.stripe_price_id, "quantity": 1}],
        success_url=settings.stripe_success_url,
        cancel_url=settings.stripe_cancel_url,
        customer_email=user_email,
        client_reference_id=str(user_id),
    )
    return session.url or "", False


def mock_period_end() -> datetime:
    return datetime.now(UTC) + timedelta(days=30)
