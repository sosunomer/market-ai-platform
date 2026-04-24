"""LLM service wrapping OpenAI with a deterministic mock fallback."""
from __future__ import annotations

from app.config import settings


def _mock_report(symbol: str, signals: dict, news_titles: list[str], mode: str) -> str:
    trend = signals.get("trend", "unknown")
    rsi_v = signals.get("rsi")
    macd_state = signals.get("macd", "neutral")
    last = signals.get("last_close")

    rsi_note = "no reading" if rsi_v is None else (
        "overbought" if rsi_v > 70 else "oversold" if rsi_v < 30 else f"neutral ({rsi_v})"
    )
    horizon = "short-term (days to weeks)" if mode == "short" else "long-term (months to a year)"
    headlines = "\n".join(f"- {t}" for t in news_titles[:5]) or "- (no recent headlines)"
    return (
        f"**{symbol} — {horizon} outlook (MOCK)**\n\n"
        f"Price action is **{trend}** with RSI {rsi_note} and MACD {macd_state}. "
        f"Last close: {last}.\n\n"
        f"Recent headlines considered:\n{headlines}\n\n"
        f"This is a placeholder report because OPENAI_API_KEY is not configured. "
        f"Set the key to get real LLM-generated analysis."
    )


def _build_prompt(symbol: str, signals: dict, news: list[dict], mode: str) -> str:
    horizon = "short-term (1-4 weeks)" if mode == "short" else "long-term (6-12 months)"
    news_block = "\n".join(
        f"- {n.get('published_at')}: {n.get('title')} ({n.get('source')})" for n in news[:10]
    ) or "(no news available)"
    return (
        f"You are a markets analyst. Produce a concise {horizon} outlook for {symbol}.\n"
        f"Indicators: {signals}.\n\n"
        f"Recent news:\n{news_block}\n\n"
        "Return sections: Summary, Bull case, Bear case, Key risks, Watch levels. "
        "Keep it under 250 words. Do NOT give direct financial advice."
    )


async def generate_report(
    symbol: str,
    signals: dict,
    news: list[dict],
    mode: str = "short",
) -> tuple[str, bool]:
    news_titles = [n.get("title", "") for n in news]
    if not settings.has_openai:
        return _mock_report(symbol, signals, news_titles, mode), True

    try:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=settings.openai_api_key)
        resp = await client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": "You are a precise, neutral markets analyst."},
                {"role": "user", "content": _build_prompt(symbol, signals, news, mode)},
            ],
            temperature=0.4,
        )
        content = resp.choices[0].message.content or ""
        return content, False
    except Exception:
        return _mock_report(symbol, signals, news_titles, mode), True


async def answer_question(symbol: str | None, signals: dict | None, question: str) -> tuple[str, bool]:
    if not settings.has_openai:
        ctx = f" about {symbol}" if symbol else ""
        return (
            f"(MOCK) I can't reach the LLM without OPENAI_API_KEY, but your question{ctx} was: "
            f"'{question}'. Configure the key for real answers.",
            True,
        )
    try:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=settings.openai_api_key)
        sys = "You are a helpful markets analyst. Be concise and neutral."
        user = (
            f"Context symbol: {symbol or 'n/a'}\nIndicators: {signals or {}}\n\n"
            f"Question: {question}"
        )
        resp = await client.chat.completions.create(
            model=settings.openai_model,
            messages=[{"role": "system", "content": sys}, {"role": "user", "content": user}],
            temperature=0.4,
        )
        return resp.choices[0].message.content or "", False
    except Exception as e:
        return f"(MOCK) LLM call failed: {e}", True
