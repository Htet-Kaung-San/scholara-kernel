"""
Pydantic schemas for the /match endpoint.
"""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.scholarship import ScholarshipRecord


# ─── User Profile (input) ────────────────────


class UserProfile(BaseModel):
    """
    Subset of the user's profile sent by the Express backend.
    Only the fields relevant to matching.
    """

    id: str
    nationality: Optional[str] = None
    residingCountry: Optional[str] = None
    educationLevel: Optional[str] = None
    currentInstitution: Optional[str] = None
    interests: list[str] = Field(default_factory=list)
    fieldOfStudy: Optional[str] = None  # free text, may not exist on profile


# ─── Request ─────────────────────────────────


class MatchRequest(BaseModel):
    """
    POST /match request body.
    Express sends the user profile + all eligible scholarships from the DB.
    """

    user_profile: UserProfile
    scholarships: list[ScholarshipRecord]
    limit: int = Field(default=20, ge=1, le=100)


# ─── Response items ──────────────────────────


class MatchResult(BaseModel):
    """One ranked scholarship with scoring details."""

    scholarship_id: str = Field(description="ID from the DB")
    score: int = Field(
        ge=0, le=100, description="Composite match score 0–100"
    )
    reasons: list[str] = Field(
        description='Why this is a good match, e.g. ["Matches your field of study"]'
    )
    missing_requirements: list[str] = Field(
        default_factory=list,
        description='What the user lacks, e.g. ["Requires IELTS 6.5"]',
    )
    explanation: str = Field(
        description="Human-readable paragraph explaining the match"
    )
    confidence: float = Field(
        ge=0.0, le=1.0, description="Confidence in the match assessment"
    )


class MatchResponse(BaseModel):
    """POST /match response body."""

    matches: list[MatchResult]
    total_evaluated: int
    profile_completeness: float = Field(
        ge=0.0,
        le=1.0,
        description="How complete the user profile is (affects match quality)",
    )
