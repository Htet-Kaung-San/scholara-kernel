"""
Embeddings service — optional vector-based matching.

This is a placeholder for future implementation. For MVP, the matcher
uses deterministic keyword-based scoring which is fast and explainable.
"""

from __future__ import annotations

import logging

log = logging.getLogger(__name__)


async def compute_embedding(text: str) -> list[float]:
    """
    Compute an embedding vector for the given text.
    Placeholder — returns empty list for MVP.
    """
    log.debug("Embedding computation not implemented (MVP uses keyword matching)")
    return []
