"""
Text cleaning and similarity utilities.
"""

from __future__ import annotations

import re
import unicodedata


def clean_text(text: str) -> str:
    """Normalize whitespace and strip a text string."""
    text = unicodedata.normalize("NFKC", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def truncate(text: str, max_chars: int = 8000) -> str:
    """Truncate text to a maximum number of characters."""
    if len(text) <= max_chars:
        return text
    return text[:max_chars] + "…[truncated]"


def normalize_country(name: str) -> str:
    """
    Rough normalization of country names for comparison.
    Lowercased, stripped, common aliases mapped.
    """
    aliases: dict[str, str] = {
        "usa": "united states",
        "us": "united states",
        "uk": "united kingdom",
        "britain": "united kingdom",
        "korea": "south korea",
        "rok": "south korea",
    }
    normalized = name.strip().lower()
    return aliases.get(normalized, normalized)


def fuzzy_contains(haystack: str, needle: str) -> bool:
    """Case-insensitive substring check."""
    return needle.strip().lower() in haystack.strip().lower()


def keyword_overlap(text_a: str, text_b: str) -> float:
    """
    Simple keyword overlap score between two texts (0–1).
    Splits on whitespace, compares lowered sets.
    """
    if not text_a or not text_b:
        return 0.0

    words_a = set(text_a.lower().split())
    words_b = set(text_b.lower().split())

    # Remove very short / common words
    stop = {"the", "a", "an", "of", "in", "for", "and", "or", "to", "is", "at", "on"}
    words_a -= stop
    words_b -= stop

    if not words_a or not words_b:
        return 0.0

    intersection = words_a & words_b
    return len(intersection) / min(len(words_a), len(words_b))
