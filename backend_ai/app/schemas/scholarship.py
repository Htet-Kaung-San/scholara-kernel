"""
Pydantic schemas for scholarship data — extraction, validation, and storage.
"""

from __future__ import annotations

from datetime import date
from enum import Enum
from typing import Optional, Union

from pydantic import BaseModel, Field, HttpUrl


# ─── Enums ────────────────────────────────────


class FundingType(str, Enum):
    FULL = "full"
    PARTIAL = "partial"
    UNKNOWN = "unknown"


class StudyLevel(str, Enum):
    HIGH_SCHOOL = "HIGH_SCHOOL"
    BACHELORS = "BACHELORS"
    MASTERS = "MASTERS"
    PHD = "PHD"


class DeadlineType(str, Enum):
    FIXED = "fixed"
    ROLLING = "rolling"
    UNKNOWN = "unknown"


# ─── Evidence ────────────────────────────────


class EvidenceSpan(BaseModel):
    """A quote from a source that supports a specific extracted field."""

    field: str = Field(description="The schema field this evidence supports")
    source_url: str = Field(description="URL of the source page")
    quote: str = Field(description="Exact text quote from the source")
    char_start: Optional[int] = Field(
        default=None, description="Character offset start in the source text"
    )
    char_end: Optional[int] = Field(
        default=None, description="Character offset end in the source text"
    )


# ─── Eligibility ─────────────────────────────


class Eligibility(BaseModel):
    """Structured eligibility criteria."""

    nationalities_allowed: list[str] = Field(
        default_factory=list,
        description="ISO country names or codes; empty = open to all",
    )
    age_min: Optional[int] = None
    age_max: Optional[int] = None
    gpa_min: Optional[float] = Field(
        default=None, description="Minimum GPA on 4.0 scale, or null"
    )
    language_requirements: list[str] = Field(
        default_factory=list,
        description='E.g. ["IELTS 6.5", "TOEFL 80"]',
    )


# ─── Benefits ────────────────────────────────


class Benefits(BaseModel):
    """Structured benefits of the scholarship."""

    tuition: Optional[str] = Field(
        default=None, description='E.g. "Full tuition coverage"'
    )
    stipend: Optional[str] = Field(
        default=None, description='E.g. "$1,500/month"'
    )
    travel: Optional[str] = Field(
        default=None, description='E.g. "Round-trip airfare included"'
    )
    other: list[str] = Field(
        default_factory=list,
        description="Any additional benefits",
    )


# ─── Extracted Scholarship ───────────────────


class ExtractedScholarship(BaseModel):
    """
    The strict JSON schema that the LLM must output when extracting
    scholarship information from web pages.

    Policy: if a field is not explicitly present in the source text,
    set it to null / empty / "unknown". No guessing.
    """

    name: str = Field(description="Official scholarship name")
    provider: str = Field(description="Organization offering the scholarship")
    official_url: Optional[str] = Field(
        default=None, description="URL of the official scholarship page"
    )
    source_urls: list[str] = Field(
        default_factory=list, description="All URLs used during extraction"
    )

    deadline: Optional[date] = Field(
        default=None, description="Application deadline (YYYY-MM-DD)"
    )
    deadline_type: DeadlineType = DeadlineType.UNKNOWN

    funding_type: FundingType = FundingType.UNKNOWN
    study_levels: list[StudyLevel] = Field(default_factory=list)
    field_of_study: Optional[str] = Field(
        default=None, description="Target field(s) of study, or null if open"
    )
    country: Optional[str] = Field(
        default=None, description="Country where the scholarship can be used"
    )
    duration: Optional[str] = None
    value: Optional[str] = Field(
        default=None, description='Human-readable value, e.g. "Full tuition + $1500/month"'
    )

    eligibility: Eligibility = Field(default_factory=Eligibility)
    benefits: Benefits = Field(default_factory=Benefits)
    required_documents: list[str] = Field(default_factory=list)

    # Auditability
    evidence: list[EvidenceSpan] = Field(default_factory=list)
    confidence: float = Field(
        default=0.0, ge=0.0, le=1.0, description="Extraction confidence 0–1"
    )
    flags: list[str] = Field(
        default_factory=list,
        description='E.g. ["expired", "needs_review", "missing_official_url"]',
    )

    description: Optional[str] = Field(
        default=None, description="Brief description of the scholarship"
    )


# ─── Existing DB Scholarship (input to /match) ─


class ScholarshipRecord(BaseModel):
    """
    A scholarship record as stored in the main Postgres DB.
    Passed to the /match endpoint by the Express backend.
    """

    id: str
    title: str
    provider: str
    country: str
    description: str
    status: str
    level: str
    duration: Optional[str] = None
    deadline: Optional[str] = None  # ISO date string
    value: str
    fieldOfStudy: str
    type: str
    eligibility: Optional[Union[dict, list]] = None
    benefits: Optional[Union[dict, list]] = None
    requirements: Optional[Union[dict, list]] = None
    featured: bool = False
