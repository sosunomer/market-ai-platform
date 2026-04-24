from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    secret_key: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 10080

    database_url: str = "postgresql+psycopg://market:market@localhost:5432/market"
    redis_url: str = "redis://localhost:6379/0"

    finnhub_api_key: str = ""

    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    stripe_secret_key: str = ""
    stripe_price_id: str = ""
    stripe_webhook_secret: str = ""
    stripe_success_url: str = "http://localhost:5173/billing/success"
    stripe_cancel_url: str = "http://localhost:5173/billing/cancel"

    allowed_origins: str = "http://localhost:5173,http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @property
    def has_finnhub(self) -> bool:
        return bool(self.finnhub_api_key)

    @property
    def has_openai(self) -> bool:
        return bool(self.openai_api_key)

    @property
    def has_stripe(self) -> bool:
        return bool(self.stripe_secret_key and self.stripe_price_id)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
