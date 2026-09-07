from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings, overridable via environment or .env file."""

    app_name: str = "Cyber Cafe Manager"
    api_prefix: str = "/api"
    database_url: str = "sqlite:///./cybercafe.db"
    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 60 * 12
    mpesa_consumer_key: str = ""
    mpesa_consumer_secret: str = ""
    mpesa_passkey: str = ""
    mpesa_shortcode: str = ""
    mpesa_env: str = "sandbox"  # sandbox | production

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
