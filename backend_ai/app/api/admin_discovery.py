"""
POST /admin/discover — discover new scholarship candidates from the web.

ADMIN-ONLY endpoint: Express backend calls this after verifying admin role.
This endpoint does NOT write to the DB — it returns proposed scholarships
for admin review and approval.

Flow:
1. Web search → candidate URLs
2. Fetch each URL → raw HTML/PDF
3. Parse → clean text
4. LLM extraction → structured JSON with evidence
5. Validation → flags + confidence
6. Dedupe → remove duplicates
7. Return proposed scholarships
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends

from app.core.security import verify_internal_key
from app.schemas.admin_discovery import (
    DiscoverRequest,
    DiscoverResponse,
    ProposedScholarship,
)
from app.schemas.scholarship import ExtractedScholarship
from app.services import web_search
from app.services.extraction import extract_scholarship
from app.services.fetch import fetch_url
from app.services.parse import parse_content
from app.services.validation import validate_and_flag

log = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post(
    "/discover",
    response_model=DiscoverResponse,
    dependencies=[Depends(verify_internal_key)],
)
async def discover_scholarships(req: DiscoverRequest) -> DiscoverResponse:
    """
    Discover new scholarship candidates from the web.

    Admin provides a search query and optional filters. The service:
    1. Searches the web for matching scholarship pages
    2. Fetches and parses each page
    3. Extracts structured data using LLM
    4. Validates and flags issues
    5. Returns proposed scholarships for admin review

    This does NOT write to the DB — admin must approve proposals.
    """
    # ── Build search query ────────────────────
    query_parts = [req.query]
    if req.degree_level:
        query_parts.append(req.degree_level)
    if req.country:
        query_parts.append(req.country)
    if req.year:
        query_parts.append(str(req.year))
    query_parts.append("scholarship")

    search_query = " ".join(query_parts)

    log.info(
        "Discovery request: query='%s', max_results=%d",
        search_query,
        req.max_results,
    )

    # ── 1. Web search ─────────────────────────
    search_results = await web_search.search(
        query=search_query,
        max_results=req.max_results * 2,  # Fetch extra in case some fail
    )

    total_urls_searched = len(search_results)
    log.info("Search returned %d URLs", total_urls_searched)

    if not search_results:
        return DiscoverResponse(
            proposed=[],
            query=search_query,
            total_urls_searched=0,
            total_urls_parsed=0,
            errors=["No search results found. Try a different query."],
        )

    # ── 2-5. Fetch → Parse → Extract → Validate ──
    proposed: list[ProposedScholarship] = []
    errors: list[str] = []
    total_parsed = 0

    for rank, result in enumerate(search_results, start=1):
        if len(proposed) >= req.max_results:
            break

        # Fetch
        raw = await fetch_url(result.url)
        if not raw:
            errors.append(f"Failed to fetch: {result.url}")
            continue

        # Parse
        text = parse_content(raw, result.url)
        if not text or len(text) < 50:
            errors.append(f"No useful content from: {result.url}")
            continue

        total_parsed += 1

        # Extract
        extracted = await extract_scholarship(
            page_text=text,
            source_url=result.url,
            search_snippet=result.snippet,
        )

        # Validate
        validated = validate_and_flag(extracted)

        # Dedupe check (within this batch)
        is_dup, dup_of = _check_duplicate(validated, proposed)

        proposed.append(
            ProposedScholarship(
                extracted=validated,
                search_query_used=search_query,
                discovery_rank=rank,
                is_duplicate=is_dup,
                duplicate_of=dup_of,
            )
        )

        log.info(
            "Extracted #%d: '%s' (confidence=%.2f, flags=%s)",
            rank,
            validated.name[:50],
            validated.confidence,
            validated.flags,
        )

    log.info(
        "Discovery complete: %d proposed, %d parsed, %d errors",
        len(proposed),
        total_parsed,
        len(errors),
    )

    return DiscoverResponse(
        proposed=proposed,
        query=search_query,
        total_urls_searched=total_urls_searched,
        total_urls_parsed=total_parsed,
        errors=errors,
    )


def _check_duplicate(
    candidate: ExtractedScholarship,
    existing: list[ProposedScholarship],
) -> tuple[bool, str | None]:
    """
    Check if a candidate scholarship is a duplicate of one already proposed.
    Uses name + provider + official_url matching.
    """
    from app.utils.text import fuzzy_contains

    for p in existing:
        ex = p.extracted

        # Exact URL match
        if (
            candidate.official_url
            and ex.official_url
            and candidate.official_url.rstrip("/") == ex.official_url.rstrip("/")
        ):
            return True, None  # No DB id to reference

        # Name + provider match
        if (
            candidate.name
            and ex.name
            and fuzzy_contains(candidate.name, ex.name)
            and candidate.provider
            and ex.provider
            and fuzzy_contains(candidate.provider, ex.provider)
        ):
            return True, None

    return False, None
