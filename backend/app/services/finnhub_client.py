"""Finnhub API client with a deterministic mock fallback.

When FINNHUB_API_KEY is not set, we synthesize plausible OHLCV candles so the
rest of the application (charts, indicators, AI) can be developed without a key.
"""
from __future__ import annotations

import hashlib
import math
import random
from datetime import UTC, datetime, timedelta

import httpx

from app.config import settings

BASE_URL = "https://finnhub.io/api/v1"

# Map UI ranges & intervals to finnhub resolutions & lookback
RANGE_TO_DAYS = {"1D": 1, "1W": 7, "1M": 30, "3M": 90, "1Y": 365}
INTERVAL_TO_RESOLUTION = {
    "1m": "1",
    "5m": "5",
    "15m": "15",
    "30m": "30",
    "1h": "60",
    "1d": "D",
    "1w": "W",
    "1M": "M",
}


def _default_interval_for(range_: str) -> str:
    if range_ == "1D":
        return "5m"
    if range_ == "1W":
        return "30m"
    if range_ in ("1M", "3M"):
        return "1d"
    return "1d"


def _seconds_per_candle(interval: str) -> int:
    return {
        "1m": 60,
        "5m": 300,
        "15m": 900,
        "30m": 1800,
        "1h": 3600,
        "1d": 86400,
        "1w": 86400 * 7,
        "1M": 86400 * 30,
    }[interval]


def _candle_count(range_: str, interval: str) -> int:
    days = RANGE_TO_DAYS[range_]
    return max(10, min(800, (days * 86400) // _seconds_per_candle(interval)))


def _mock_candles(symbol: str, range_: str, interval: str) -> list[dict]:
    """Generate reproducible candles for development/testing without an API key."""
    seed = int(hashlib.sha256(symbol.encode()).hexdigest(), 16) % (2**32)
    rng = random.Random(seed)
    n = _candle_count(range_, interval)
    step = _seconds_per_candle(interval)
    now = datetime.now(UTC).replace(second=0, microsecond=0)
    base = 50 + (seed % 400)
    candles: list[dict] = []
    price = base
    for i in range(n):
        ts = now - timedelta(seconds=step * (n - i - 1))
        drift = math.sin(i / 12) * 0.4
        change = rng.uniform(-1.5, 1.5) + drift
        open_ = price
        close = max(1.0, open_ + change)
        high = max(open_, close) + rng.uniform(0, 0.8)
        low = min(open_, close) - rng.uniform(0, 0.8)
        volume = rng.randint(100_000, 5_000_000)
        candles.append(
            {
                "ts": ts,
                "open": round(open_, 2),
                "high": round(high, 2),
                "low": round(low, 2),
                "close": round(close, 2),
                "volume": volume,
            }
        )
        price = close
    return candles


async def fetch_candles(symbol: str, range_: str, interval: str | None = None) -> tuple[list[dict], str]:
    interval = interval or _default_interval_for(range_)
    if not settings.has_finnhub:
        return _mock_candles(symbol, range_, interval), "mock"

    resolution = INTERVAL_TO_RESOLUTION.get(interval, "D")
    now = int(datetime.now(UTC).timestamp())
    frm = now - RANGE_TO_DAYS[range_] * 86400

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.get(
                f"{BASE_URL}/stock/candle",
                params={
                    "symbol": symbol,
                    "resolution": resolution,
                    "from": frm,
                    "to": now,
                    "token": settings.finnhub_api_key,
                },
            )
            r.raise_for_status()
            data = r.json()
    except httpx.HTTPError:
        return _mock_candles(symbol, range_, interval), "mock"

    if data.get("s") != "ok" or not data.get("t"):
        return _mock_candles(symbol, range_, interval), "mock"

    candles: list[dict] = []
    for ts, o, h, low_, c, v in zip(
        data["t"], data["o"], data["h"], data["l"], data["c"], data["v"], strict=False
    ):
        candles.append(
            {
                "ts": datetime.fromtimestamp(ts, tz=UTC),
                "open": float(o),
                "high": float(h),
                "low": float(low_),
                "close": float(c),
                "volume": int(v),
            }
        )
    return candles, "finnhub"


async def fetch_quote(symbol: str) -> dict:
    if not settings.has_finnhub:
        candles = _mock_candles(symbol, "1D", "5m")
        last = candles[-1]
        prev = candles[-2] if len(candles) > 1 else last
        return {
            "c": last["close"],
            "o": last["open"],
            "h": last["high"],
            "l": last["low"],
            "pc": prev["close"],
            "source": "mock",
        }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(
                f"{BASE_URL}/quote",
                params={"symbol": symbol, "token": settings.finnhub_api_key},
            )
            r.raise_for_status()
            data = r.json()
            data["source"] = "finnhub"
            return data
    except httpx.HTTPError:
        return {"source": "error"}


async def fetch_company_news(symbol: str, days: int = 14) -> list[dict]:
    if not settings.has_finnhub:
        now = datetime.now(UTC)
        return [
            {
                "source": "MockWire",
                "published_at": now - timedelta(hours=i * 6),
                "title": f"{symbol}: placeholder headline #{i + 1}",
                "url": f"https://example.com/{symbol.lower()}/{i}",
                "summary": f"Mock summary for {symbol} article {i + 1}. Set FINNHUB_API_KEY for real news.",
            }
            for i in range(6)
        ]
    frm = (datetime.now(UTC) - timedelta(days=days)).date().isoformat()
    to = datetime.now(UTC).date().isoformat()
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.get(
                f"{BASE_URL}/company-news",
                params={
                    "symbol": symbol,
                    "from": frm,
                    "to": to,
                    "token": settings.finnhub_api_key,
                },
            )
            r.raise_for_status()
            rows = r.json() or []
    except httpx.HTTPError:
        return []
    out: list[dict] = []
    for row in rows[:40]:
        out.append(
            {
                "source": row.get("source", "Finnhub"),
                "published_at": datetime.fromtimestamp(row.get("datetime", 0), tz=UTC),
                "title": row.get("headline", "")[:500],
                "url": row.get("url", ""),
                "summary": row.get("summary", "")[:2000],
            }
        )
    return out
