"""Application configuration.

All secrets and tunable model names are loaded from environment variables.
Never hard-code API keys in source.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime settings loaded from environment / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Gemini API ---
    # Required. Must be supplied via the GEMINI_API_KEY env var.
    gemini_api_key: str

    # Model is configurable so the project can pin or upgrade without code changes.
    # Default points to the current stable Flash-tier model from Google.
    gemini_model: str = "gemini-3.7-flash"

    # --- Server ---
    app_name: str = "MyFitness AI"
    app_version: str = "0.1.0"
    api_v1_prefix: str = "/api/v1"

    # --- Conversation memory ---
    # In-memory: cap each session to the most recent N messages.
    max_session_messages: int = 10

    # --- LLM behavior ---
    llm_timeout_seconds: float = 30.0
    llm_temperature: float = 0.7


@lru_cache
def get_settings() -> Settings:
    """Return cached settings instance.

    Raises pydantic ValidationError if required env vars are missing.
    """
    return Settings()
