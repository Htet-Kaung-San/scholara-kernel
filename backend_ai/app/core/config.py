"""
Scholara AI Service — Configuration.

Loads settings from environment variables with validation.
"""

from __future__ import annotations

from enum import Enum
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class LLMProvider(str, Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"


class SearchProvider(str, Enum):
    TAVILY = "tavily"
    SERPAPI = "serpapi"
    BRAVE = "brave"
    NONE = "none"


class Settings(BaseSettings):
    """Application settings, populated from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ─── Internal Auth ────────────────────────────
    internal_api_key: str

    # ─── LLM ─────────────────────────────────────
    llm_provider: LLMProvider = LLMProvider.OPENAI
    llm_api_key: str = ""
    llm_model: str = "gpt-4o-mini"

    # ─── Web Search ───────────────────────────────
    search_provider: SearchProvider = SearchProvider.NONE
    search_api_key: str = ""

    # ─── Fetch ────────────────────────────────────
    fetch_timeout_seconds: int = 15

    # ─── Server ───────────────────────────────────
    host: str = "0.0.0.0"
    port: int = 8001
    log_level: str = "info"


# Singleton — imported everywhere as `from app.core.config import settings`
settings = Settings()  # type: ignore[call-arg]
