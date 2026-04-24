from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import ai, auth, markets, news, prices, subscriptions
from app.config import settings

app = FastAPI(title="Market AI Platform API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(markets.router)
app.include_router(prices.router)
app.include_router(news.router)
app.include_router(ai.router)
app.include_router(subscriptions.router)


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "env": settings.app_env,
        "providers": {
            "finnhub": settings.has_finnhub,
            "openai": settings.has_openai,
            "stripe": settings.has_stripe,
        },
    }
