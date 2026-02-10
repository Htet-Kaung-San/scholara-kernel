"""
Scholara AI Service — Internal API key security.

FastAPI dependency that validates the X-INTERNAL-KEY header.
Express backend must send this header on every call.
"""

from __future__ import annotations

from fastapi import Header, HTTPException, status

from app.core.config import settings


async def verify_internal_key(
    x_internal_key: str = Header(..., alias="X-INTERNAL-KEY"),
) -> str:
    """
    Dependency: reject requests without a valid internal API key.

    Usage:
        @router.post("/match", dependencies=[Depends(verify_internal_key)])
    """
    if x_internal_key != settings.internal_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing internal API key",
        )
    return x_internal_key
