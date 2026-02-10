"""
Deterministic validation rules for extracted scholarship data.

These rules are applied AFTER LLM extraction to:
1. Flag expired scholarships
2. Validate evidence completeness
3. Compute confidence scores
4. Normalize fields
"""

from __future__ import annotations

import logging
from datetime import date

from app.schemas.scholarship import ExtractedScholarship, FundingType
from app.utils.dates import is_expired, parse_date

log = logging.getLogger(__name__)


# ─── Key fields that SHOULD have evidence ─────

EVIDENCE_REQUIRED_FIELDS = {
    "deadline",
    "funding_type",
    "nationalities_allowed",
    "value",
}


def validate_and_flag(scholarship: ExtractedScholarship) -> ExtractedScholarship:
    """
    Apply deterministic validation rules to an extracted scholarship.

    Mutates and returns the scholarship with updated flags and confidence.
    """
    flags: list[str] = list(scholarship.flags)
    confidence = scholarship.confidence

    # ── Rule 1: Expired deadline ──────────────
    if scholarship.deadline and is_expired(scholarship.deadline):
        if "expired" not in flags:
            flags.append("expired")
        log.debug("Flagged expired: %s (deadline %s)", scholarship.name, scholarship.deadline)

    # ── Rule 2: Missing official URL ──────────
    if not scholarship.official_url:
        if "missing_official_url" not in flags:
            flags.append("missing_official_url")
        confidence = min(confidence, 0.4)
        log.debug("Flagged missing_official_url: %s", scholarship.name)

    # ── Rule 3: Funding type without evidence ─
    if scholarship.funding_type != FundingType.UNKNOWN:
        has_funding_evidence = any(
            e.field in ("funding_type", "value", "tuition", "stipend")
            for e in scholarship.evidence
        )
        if not has_funding_evidence:
            if "funding_type_unverified" not in flags:
                flags.append("funding_type_unverified")
            confidence = min(confidence, confidence * 0.8)
            log.debug("Flagged funding_type_unverified: %s", scholarship.name)

    # ── Rule 4: Evidence completeness ─────────
    evidence_fields = {e.field for e in scholarship.evidence}
    missing_evidence = EVIDENCE_REQUIRED_FIELDS - evidence_fields

    if missing_evidence:
        for field in missing_evidence:
            flag = f"missing_evidence_{field}"
            if flag not in flags:
                flags.append(flag)

        # Downgrade confidence proportionally
        coverage = len(evidence_fields & EVIDENCE_REQUIRED_FIELDS) / len(EVIDENCE_REQUIRED_FIELDS)
        confidence = min(confidence, 0.3 + 0.7 * coverage)

    # ── Rule 5: No name or provider ───────────
    if not scholarship.name or scholarship.name.startswith("Unknown"):
        if "needs_review" not in flags:
            flags.append("needs_review")
        confidence = min(confidence, 0.2)

    if not scholarship.provider or scholarship.provider == "Unknown":
        if "unknown_provider" not in flags:
            flags.append("unknown_provider")
        confidence = min(confidence, 0.3)

    # ── Rule 6: Confidence floor ──────────────
    confidence = max(0.0, min(1.0, round(confidence, 2)))

    # ── Apply mutations ───────────────────────
    scholarship.flags = flags
    scholarship.confidence = confidence

    return scholarship


def is_eligible_for_user(
    scholarship: ExtractedScholarship,
    user_nationality: str | None,
) -> tuple[bool, list[str]]:
    """
    Check if a user is eligible for a scholarship based on deterministic rules.

    Returns (is_eligible, list_of_reasons_why_not).
    """
    reasons: list[str] = []

    # Check expiry
    if scholarship.deadline and is_expired(scholarship.deadline):
        reasons.append("Scholarship deadline has passed")

    # Check nationality
    allowed = scholarship.eligibility.nationalities_allowed
    if allowed and user_nationality:
        from app.utils.text import normalize_country
        user_norm = normalize_country(user_nationality)
        allowed_norm = [normalize_country(c) for c in allowed]
        if user_norm not in allowed_norm:
            reasons.append(
                f"Restricted to: {', '.join(allowed)}"
            )

    is_eligible = len(reasons) == 0
    return is_eligible, reasons
