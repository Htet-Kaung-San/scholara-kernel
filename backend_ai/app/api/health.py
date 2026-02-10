"""
Health check endpoint.
"""

from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict:
    """
    Health check — no auth required.
    Express backend can use this to verify the AI service is running.
    """
    return {
        "ok": True,
        "version": "0.1.0",
        "service": "scholara-ai",
    }
