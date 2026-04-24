"""Seed a minimal set of markets + popular instruments for MVP demo.

Idempotent: safe to run on every container start.
"""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.models.instrument import Instrument
from app.models.market import Market

MARKETS = [
    {"code": "US_NASDAQ", "name": "NASDAQ", "country": "USA", "timezone": "America/New_York", "kind": "equity"},
    {"code": "US_NYSE", "name": "NYSE", "country": "USA", "timezone": "America/New_York", "kind": "equity"},
    {"code": "CRYPTO", "name": "Crypto (Binance)", "country": "GLOBAL", "timezone": "UTC", "kind": "crypto"},
]

INSTRUMENTS = [
    # NASDAQ
    ("AAPL", "Apple Inc.", "US_NASDAQ", "Technology", "USD", "equity"),
    ("MSFT", "Microsoft Corporation", "US_NASDAQ", "Technology", "USD", "equity"),
    ("GOOGL", "Alphabet Inc.", "US_NASDAQ", "Communication Services", "USD", "equity"),
    ("AMZN", "Amazon.com, Inc.", "US_NASDAQ", "Consumer Discretionary", "USD", "equity"),
    ("META", "Meta Platforms, Inc.", "US_NASDAQ", "Communication Services", "USD", "equity"),
    ("NVDA", "NVIDIA Corporation", "US_NASDAQ", "Technology", "USD", "equity"),
    ("TSLA", "Tesla, Inc.", "US_NASDAQ", "Consumer Discretionary", "USD", "equity"),
    ("AMD", "Advanced Micro Devices", "US_NASDAQ", "Technology", "USD", "equity"),
    # NYSE
    ("JPM", "JPMorgan Chase & Co.", "US_NYSE", "Financials", "USD", "equity"),
    ("KO", "The Coca-Cola Company", "US_NYSE", "Consumer Staples", "USD", "equity"),
    ("V", "Visa Inc.", "US_NYSE", "Financials", "USD", "equity"),
    ("DIS", "The Walt Disney Company", "US_NYSE", "Communication Services", "USD", "equity"),
    # Crypto (Finnhub format: BINANCE:BTCUSDT)
    ("BINANCE:BTCUSDT", "Bitcoin / USDT", "CRYPTO", "Crypto", "USDT", "crypto"),
    ("BINANCE:ETHUSDT", "Ethereum / USDT", "CRYPTO", "Crypto", "USDT", "crypto"),
    ("BINANCE:SOLUSDT", "Solana / USDT", "CRYPTO", "Crypto", "USDT", "crypto"),
]


def seed(db: Session) -> None:
    code_to_id: dict[str, int] = {}
    for m in MARKETS:
        existing = db.query(Market).filter(Market.code == m["code"]).first()
        if existing:
            code_to_id[m["code"]] = existing.id
            continue
        row = Market(**m)
        db.add(row)
        db.flush()
        code_to_id[m["code"]] = row.id

    for symbol, name, market_code, sector, currency, kind in INSTRUMENTS:
        market_id = code_to_id[market_code]
        existing = (
            db.query(Instrument)
            .filter(Instrument.symbol == symbol, Instrument.market_id == market_id)
            .first()
        )
        if existing:
            continue
        db.add(
            Instrument(
                symbol=symbol,
                name=name,
                market_id=market_id,
                sector=sector,
                currency=currency,
                kind=kind,
            )
        )
    db.commit()


def main() -> None:
    db = SessionLocal()
    try:
        seed(db)
        print("Seed complete.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
