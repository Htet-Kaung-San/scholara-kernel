"""
Scholara AI Service — FastAPI entry point.

Run with:
    uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import setup_logging


# ─── Lifespan ─────────────────────────────────


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    """Startup / shutdown logic."""
    setup_logging()

    import logging

    log = logging.getLogger("scholara_ai")
    log.info("🧠 Scholara AI Service starting")
    log.info("   LLM provider : %s / %s", settings.llm_provider.value, settings.llm_model)
    log.info("   Search        : %s", settings.search_provider.value)
    log.info("   Port          : %s", settings.port)

    yield

    log.info("🛑 Scholara AI Service shutting down")


# ─── App ──────────────────────────────────────

app = FastAPI(
    title="Scholara AI Service",
    description="AI-powered scholarship matching and discovery for Scholara.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Internal service — locked by API key, not CORS
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Register Routers ────────────────────────

from app.api.health import router as health_router  # noqa: E402
from app.api.match import router as match_router  # noqa: E402
from app.api.admin_discovery import router as admin_discovery_router  # noqa: E402

@app.get("/")
async def root():
    return {
        "message": "Welcome to Scholara AI Service",
        "docs": "/docs",
        "health": "/health",
    }


app.include_router(health_router)
app.include_router(match_router)
app.include_router(admin_discovery_router)
