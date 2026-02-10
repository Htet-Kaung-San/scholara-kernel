"""
LLM-powered scholarship extraction — strict JSON with evidence spans.

Given the text content of a web page, extracts structured scholarship
data using the LLM as a *data extractor* (not as a database).
"""

from __future__ import annotations

import json
import logging
from typing import Any

from app.schemas.scholarship import ExtractedScholarship
from app.services import llm_client

log = logging.getLogger(__name__)


# ─── Extraction Prompt ────────────────────────

SYSTEM_PROMPT = """You are a precise data extraction engine. Your job is to extract structured scholarship information from the provided web page text.

RULES — you MUST follow these strictly:
1. Extract ONLY information that is EXPLICITLY stated in the text.
2. If a field is not mentioned or cannot be determined from the text, set it to null, empty list, or "unknown" as appropriate.
3. NEVER guess, infer, or hallucinate information.
4. For each key field you extract (deadline, funding_type, nationalities, etc.), provide an evidence quote: the exact substring from the source text that supports your extraction.
5. Dates must be in YYYY-MM-DD format. If only a month/year is given, use the last day of that month.
6. Confidence should reflect how complete and clear the source text is:
   - 0.9-1.0: Official page with all key fields clearly stated
   - 0.7-0.8: Most fields present, some minor ambiguity
   - 0.5-0.6: Partial information, some fields inferred from context
   - 0.3-0.4: Minimal information, many unknowns
   - 0.0-0.2: Very unreliable or insufficient text

Respond with ONLY a valid JSON object matching this exact schema:
{
  "name": "string — official scholarship name",
  "provider": "string — organization offering the scholarship",
  "official_url": "string|null — URL of the official scholarship page",
  "source_urls": ["string — all URLs used"],
  "deadline": "YYYY-MM-DD|null",
  "deadline_type": "fixed|rolling|unknown",
  "funding_type": "full|partial|unknown",
  "study_levels": ["HIGH_SCHOOL"|"BACHELORS"|"MASTERS"|"PHD"],
  "field_of_study": "string|null",
  "country": "string|null — country where scholarship is used",
  "duration": "string|null",
  "value": "string|null — human-readable value",
  "eligibility": {
    "nationalities_allowed": ["string"],
    "age_min": null|int,
    "age_max": null|int,
    "gpa_min": null|float,
    "language_requirements": ["string"]
  },
  "benefits": {
    "tuition": "string|null",
    "stipend": "string|null",
    "travel": "string|null",
    "other": ["string"]
  },
  "required_documents": ["string"],
  "evidence": [
    {
      "field": "deadline",
      "source_url": "https://...",
      "quote": "exact text from source",
      "char_start": null|int,
      "char_end": null|int
    }
  ],
  "confidence": 0.0-1.0,
  "flags": ["string — e.g. expired, needs_review, missing_official_url"],
  "description": "string|null — brief description"
}"""


async def extract_scholarship(
    page_text: str,
    source_url: str,
    *,
    search_snippet: str = "",
) -> ExtractedScholarship:
    """
    Extract structured scholarship data from web page text.

    Args:
        page_text: The cleaned text content of the web page.
        source_url: The URL the text was fetched from.
        search_snippet: Optional search result snippet for additional context.

    Returns:
        An ExtractedScholarship with all fields populated from the text.
    """
    user_prompt = f"""Extract scholarship information from the following web page.

SOURCE URL: {source_url}

SEARCH SNIPPET (if available):
{search_snippet or "(none)"}

WEB PAGE TEXT:
{page_text}"""

    try:
        data = await llm_client.complete_json(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.0,
            max_tokens=4096,
        )

        # Ensure source_urls includes the source_url
        if "source_urls" not in data or not data["source_urls"]:
            data["source_urls"] = [source_url]
        elif source_url not in data["source_urls"]:
            data["source_urls"].append(source_url)

        return ExtractedScholarship.model_validate(data)

    except ValueError as e:
        log.error("Extraction failed for %s: %s", source_url, e)
        # Return a minimal placeholder with low confidence
        return ExtractedScholarship(
            name=f"Unknown (extraction failed from {source_url})",
            provider="Unknown",
            source_urls=[source_url],
            confidence=0.1,
            flags=["extraction_failed", "needs_review"],
        )
    except Exception as e:
        log.error("Unexpected extraction error for %s: %s", source_url, e)
        return ExtractedScholarship(
            name=f"Unknown (error from {source_url})",
            provider="Unknown",
            source_urls=[source_url],
            confidence=0.0,
            flags=["extraction_error", "needs_review"],
        )
