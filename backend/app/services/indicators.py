"""Pure-python/pandas technical indicators. No external TA library required."""
from __future__ import annotations

import pandas as pd


def _series(values: list[float]) -> pd.Series:
    return pd.Series(values, dtype="float64")


def moving_average(closes: list[float], window: int) -> list[float | None]:
    s = _series(closes).rolling(window=window, min_periods=window).mean()
    return [None if pd.isna(v) else float(v) for v in s]


def rsi(closes: list[float], period: int = 14) -> list[float | None]:
    s = _series(closes)
    delta = s.diff()
    gain = delta.clip(lower=0).ewm(alpha=1 / period, adjust=False).mean()
    loss = (-delta.clip(upper=0)).ewm(alpha=1 / period, adjust=False).mean()
    rs = gain / loss.replace(0, 1e-9)
    rsi_series = 100 - (100 / (1 + rs))
    return [None if pd.isna(v) else float(v) for v in rsi_series]


def macd(
    closes: list[float],
    fast: int = 12,
    slow: int = 26,
    signal: int = 9,
) -> tuple[list[float | None], list[float | None], list[float | None]]:
    s = _series(closes)
    ema_fast = s.ewm(span=fast, adjust=False).mean()
    ema_slow = s.ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    hist = macd_line - signal_line
    return (
        [None if pd.isna(v) else float(v) for v in macd_line],
        [None if pd.isna(v) else float(v) for v in signal_line],
        [None if pd.isna(v) else float(v) for v in hist],
    )


def compute_all(closes: list[float]) -> dict:
    macd_line, signal_line, hist = macd(closes)
    return {
        "ma20": moving_average(closes, 20),
        "ma50": moving_average(closes, 50),
        "ma200": moving_average(closes, 200),
        "rsi14": rsi(closes, 14),
        "macd": macd_line,
        "macd_signal": signal_line,
        "macd_hist": hist,
    }


def latest_signal(closes: list[float]) -> dict:
    """Return a small summary used by the AI service to build a report."""
    if len(closes) < 50:
        return {"trend": "unknown", "rsi": None, "macd": None}
    ma20 = moving_average(closes, 20)[-1]
    ma50 = moving_average(closes, 50)[-1]
    rsi_val = rsi(closes, 14)[-1]
    macd_line, signal_line, _ = macd(closes)
    macd_val = macd_line[-1]
    macd_sig = signal_line[-1]

    if ma20 is None or ma50 is None:
        trend = "unknown"
    elif ma20 > ma50:
        trend = "bullish"
    elif ma20 < ma50:
        trend = "bearish"
    else:
        trend = "neutral"

    macd_state = "neutral"
    if macd_val is not None and macd_sig is not None:
        if macd_val > macd_sig:
            macd_state = "bullish"
        elif macd_val < macd_sig:
            macd_state = "bearish"

    return {
        "trend": trend,
        "rsi": round(rsi_val, 2) if rsi_val is not None else None,
        "macd": macd_state,
        "last_close": round(closes[-1], 4),
    }
