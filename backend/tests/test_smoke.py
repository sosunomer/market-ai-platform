"""Smoke tests that exercise the FastAPI app against a SQLite in-memory DB."""
from __future__ import annotations

import os

os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-secret")

from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

from app import db as db_module  # noqa: E402
from app.db import Base  # noqa: E402
from app.main import app  # noqa: E402
from app.seed import seed  # noqa: E402


def _setup_test_db():
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    # Replace the app's dependency and seed
    app.dependency_overrides[db_module.get_db] = override_get_db
    with TestingSessionLocal() as s:
        seed(s)
    return TestingSessionLocal


def test_health_and_flow():
    _setup_test_db()
    client = TestClient(app)

    # health
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert "providers" in body

    # register + login
    r = client.post("/api/auth/register", json={"email": "a@b.com", "password": "secret123"})
    assert r.status_code == 200, r.text
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    r = client.get("/api/auth/me", headers=headers)
    assert r.status_code == 200
    assert r.json()["email"] == "a@b.com"

    # markets and instruments
    r = client.get("/api/markets")
    assert r.status_code == 200
    markets = r.json()
    assert len(markets) >= 1

    r = client.get(f"/api/markets/{markets[0]['id']}/instruments")
    assert r.status_code == 200
    instruments = r.json()
    assert len(instruments) >= 1
    inst_id = instruments[0]["id"]

    # prices + indicators (mock path)
    r = client.get(f"/api/instruments/{inst_id}/prices?range=1M")
    assert r.status_code == 200
    assert len(r.json()["candles"]) > 10

    r = client.get(f"/api/instruments/{inst_id}/indicators?range=3M")
    assert r.status_code == 200
    ind = r.json()
    assert "rsi14" in ind

    # AI report (mock path, short mode allowed on free plan)
    r = client.post(
        "/api/ai/report",
        headers=headers,
        json={"instrument_id": inst_id, "mode": "short", "timeframe": "1M"},
    )
    assert r.status_code == 200, r.text
    assert r.json()["mocked"] is True

    # Long mode requires premium
    r = client.post(
        "/api/ai/report",
        headers=headers,
        json={"instrument_id": inst_id, "mode": "long", "timeframe": "1Y"},
    )
    assert r.status_code == 402

    # subscription checkout (mock auto-activates premium)
    r = client.post("/api/subscriptions/checkout", headers=headers)
    assert r.status_code == 200, r.text
    assert r.json()["mocked"] is True

    r = client.get("/api/subscriptions/status", headers=headers)
    assert r.status_code == 200
    assert r.json()["active"] is True

    # now long mode works
    r = client.post(
        "/api/ai/report",
        headers=headers,
        json={"instrument_id": inst_id, "mode": "long", "timeframe": "1Y"},
    )
    assert r.status_code == 200, r.text

    # AI chat (premium only)
    r = client.post(
        "/api/ai/chat",
        headers=headers,
        json={"instrument_id": inst_id, "question": "Is this a buy?"},
    )
    assert r.status_code == 200, r.text
