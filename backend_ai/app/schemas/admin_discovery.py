"""
Pydantic schemas for the POST /admin/discover endpoint.
"""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.scholarship import ExtractedScholarship


# ─── Request ─────────────────────────────────


class DiscoverRequest(BaseModel):
    """
    POST /admin/discover request body.
    Admin provides a search query and optional filters.
    """

    query: str = Field(
        description='Search query, e.g. "ASEAN scholarships for masters 2026"'
    )
    degree_level: Optional[str] = Field(
        default=None, description="Filter: BACHELORS, MASTERS, PHD, etc."
    )
    country: Optional[str] = Field(
        default=None, description="Filter: target country"
    )
    year: Optional[int] = Field(
        default=None, description="Filter: target academic year"
    )
    max_results: int = Field(
        default=5, ge=1, le=15, description="Max number of scholarship candidates to return"
    )


# ─── Response items ──────────────────────────


class ProposedScholarship(BaseModel):
    """
    A scholarship candidate discovered from the web.
    NOT yet verified — admin must review and approve before it enters the DB.
    """

    extracted: ExtractedScholarship
    search_query_used: str
    discovery_rank: int = Field(description="Position in search results")
    is_duplicate: bool = Field(
        default=False,
        description="True if this looks like a duplicate of an existing DB record",
    )
    duplicate_of: Optional[str] = Field(
        default=None,
        description="ID of the existing scholarship this may duplicate",
    )


class DiscoverResponse(BaseModel):
    """POST /admin/discover response body."""

    proposed: list[ProposedScholarship]
    query: str
    total_urls_searched: int
    total_urls_parsed: int
    errors: list[str] = Field(
        default_factory=list,
        description="Non-fatal errors encountered during discovery",
    )
