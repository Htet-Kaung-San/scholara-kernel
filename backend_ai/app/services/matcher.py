"""
Scholarship matcher — deterministic scoring + LLM explanation.

Ranks VERIFIED scholarships for a user profile. No web calls.
"""

from __future__ import annotations

import logging
from typing import Optional

from app.schemas.match import MatchResult, UserProfile
from app.schemas.scholarship import ScholarshipRecord
from app.services import llm_client
from app.utils.dates import is_expired, days_until, parse_date
from app.utils.text import fuzzy_contains, keyword_overlap, normalize_country

log = logging.getLogger(__name__)


# ─── Score Weights ────────────────────────────
# These sum to ~100 for a perfect match

W_STATUS = 15         # Is scholarship open?
W_DEADLINE = 10       # How much time is left?
W_FIELD = 25          # Field of study overlap
W_LEVEL = 20          # Education level match
W_COUNTRY = 10        # Country match
W_NATIONALITY = 10    # Nationality eligibility
W_INTEREST = 10       # Interest keyword overlap


def compute_profile_completeness(profile: UserProfile) -> float:
    """Rate how complete the user profile is (0–1)."""
    fields = [
        profile.nationality,
        profile.educationLevel,
        profile.fieldOfStudy,
        profile.interests,
        profile.residingCountry,
    ]
    filled = sum(1 for f in fields if f)
    return round(filled / len(fields), 2)


def _score_scholarship(
    profile: UserProfile,
    scholarship: ScholarshipRecord,
) -> tuple[int, list[str], list[str]]:
    """
    Compute a deterministic match score (0–100) for a scholarship.

    Returns (score, reasons, missing_requirements).
    """
    score = 0
    reasons: list[str] = []
    missing: list[str] = []

    # ── 1. Status gate ────────────────────────
    if scholarship.status != "OPEN":
        missing.append(f"Scholarship status is {scholarship.status}")
        # Still score it but cap later
    else:
        score += W_STATUS
        reasons.append("Scholarship is open for applications")

    # ── 2. Deadline ───────────────────────────
    if scholarship.deadline:
        dl = parse_date(scholarship.deadline)
        if dl and is_expired(dl):
            missing.append("Application deadline has passed")
        else:
            remaining = days_until(dl)
            if remaining is not None:
                if remaining > 30:
                    score += W_DEADLINE
                    reasons.append(f"{remaining} days until deadline")
                elif remaining > 7:
                    score += W_DEADLINE // 2
                    reasons.append(f"Deadline approaching ({remaining} days)")
                else:
                    score += W_DEADLINE // 4
                    missing.append(f"Deadline very soon ({remaining} days)")
    else:
        # No deadline = probably rolling or unknown
        score += W_DEADLINE // 2

    # ── 3. Field of study ─────────────────────
    if profile.fieldOfStudy and scholarship.fieldOfStudy:
        overlap = keyword_overlap(profile.fieldOfStudy, scholarship.fieldOfStudy)
        field_score = int(W_FIELD * min(overlap * 2, 1.0))  # boost partial matches
        score += field_score
        if overlap > 0.3:
            reasons.append(f"Your field ({profile.fieldOfStudy}) matches")
        elif overlap > 0:
            reasons.append("Partial field of study overlap")
    elif not profile.fieldOfStudy:
        # Can't evaluate — give partial score
        score += W_FIELD // 3

    # ── 4. Education level ────────────────────
    if profile.educationLevel and scholarship.level:
        level_map = {
            "high school": ["HIGH_SCHOOL", "UNDERGRADUATE"],
            "bachelor's degree": ["BACHELORS", "UNDERGRADUATE"],
            "master's degree": ["MASTERS", "GRADUATE", "POSTGRADUATE"],
            "phd": ["PHD", "DOCTORAL", "GRADUATE", "POSTGRADUATE"],
        }
        user_level = profile.educationLevel.lower()
        scholarship_level = scholarship.level.lower()

        matched = False
        for key, aliases in level_map.items():
            if key in user_level or user_level in key:
                for alias in aliases:
                    if alias.lower() in scholarship_level or scholarship_level in alias.lower():
                        matched = True
                        break
            if matched:
                break

        # Also try direct substring match
        if not matched and fuzzy_contains(scholarship_level, user_level):
            matched = True
        if not matched and fuzzy_contains(user_level, scholarship_level):
            matched = True

        if matched:
            score += W_LEVEL
            reasons.append("Education level matches")
        else:
            missing.append(
                f"Scholarship is for {scholarship.level}, you are {profile.educationLevel}"
            )
    elif not profile.educationLevel:
        score += W_LEVEL // 3

    # ── 5. Country ────────────────────────────
    if profile.residingCountry and scholarship.country:
        if normalize_country(profile.residingCountry) == normalize_country(scholarship.country):
            score += W_COUNTRY
            reasons.append(f"Available in your country ({scholarship.country})")
    elif not profile.residingCountry:
        score += W_COUNTRY // 3

    # ── 6. Nationality eligibility ────────────
    if scholarship.eligibility and isinstance(scholarship.eligibility, dict):
        nat_allowed = scholarship.eligibility.get("nationalities_allowed", [])
        if nat_allowed and isinstance(nat_allowed, list) and len(nat_allowed) > 0:
            if profile.nationality:
                user_nat = normalize_country(profile.nationality)
                allowed_norm = [normalize_country(c) for c in nat_allowed]
                if user_nat in allowed_norm:
                    score += W_NATIONALITY
                    reasons.append("Your nationality is eligible")
                else:
                    missing.append(
                        f"Restricted to: {', '.join(nat_allowed[:5])}"
                    )
            else:
                # Can't check — partial score
                score += W_NATIONALITY // 3
        else:
            # Open to all nationalities
            score += W_NATIONALITY
            reasons.append("Open to all nationalities")
    else:
        # No eligibility info — assume open
        score += W_NATIONALITY // 2

    # ── 7. Interest overlap ───────────────────
    if profile.interests and scholarship.description:
        interest_text = " ".join(profile.interests)
        overlap = keyword_overlap(interest_text, scholarship.description)
        interest_score = int(W_INTEREST * min(overlap * 3, 1.0))
        score += interest_score
        if overlap > 0.2:
            reasons.append("Matches your interests")
    elif not profile.interests:
        score += W_INTEREST // 3

    # ── Cap score if not OPEN ─────────────────
    if scholarship.status != "OPEN":
        score = min(score, 30)

    # Clamp
    score = max(0, min(100, score))

    return score, reasons, missing


async def rank_scholarships(
    profile: UserProfile,
    scholarships: list[ScholarshipRecord],
    *,
    limit: int = 20,
    generate_explanations: bool = True,
) -> list[MatchResult]:
    """
    Score and rank scholarships for a user profile.

    Args:
        profile: The user's profile data.
        scholarships: List of verified scholarships from the DB.
        limit: Maximum number of results to return.
        generate_explanations: Whether to generate LLM explanations.

    Returns:
        Sorted list of MatchResult (highest score first).
    """
    scored: list[tuple[int, list[str], list[str], ScholarshipRecord]] = []

    for s in scholarships:
        score, reasons, missing = _score_scholarship(profile, s)
        scored.append((score, reasons, missing, s))

    # Sort by score descending
    scored.sort(key=lambda x: x[0], reverse=True)

    # Take top N
    scored = scored[:limit]

    # Build results
    results: list[MatchResult] = []

    for score, reasons, missing, s in scored:
        explanation = ""
        if generate_explanations and score > 20:
            explanation = await _generate_explanation(profile, s, score, reasons, missing)

        confidence = _compute_match_confidence(profile, score, reasons, missing)

        results.append(
            MatchResult(
                scholarship_id=s.id,
                score=score,
                reasons=reasons,
                missing_requirements=missing,
                explanation=explanation or _fallback_explanation(s, score, reasons),
                confidence=confidence,
            )
        )

    return results


def _compute_match_confidence(
    profile: UserProfile,
    score: int,
    reasons: list[str],
    missing: list[str],
) -> float:
    """Simple confidence heuristic based on profile completeness and score."""
    completeness = compute_profile_completeness(profile)

    # Base confidence from score
    base = score / 100.0

    # Penalize low completeness
    adjusted = base * (0.5 + 0.5 * completeness)

    return round(max(0.0, min(1.0, adjusted)), 2)


async def _generate_explanation(
    profile: UserProfile,
    scholarship: ScholarshipRecord,
    score: int,
    reasons: list[str],
    missing: list[str],
) -> str:
    """
    Use the LLM to generate a grounded, human-readable explanation.
    The LLM acts as narrator, not as a database — it explains the
    deterministic scoring results.
    """
    try:
        system = (
            "You are a scholarship advisor. Write a concise 2-3 sentence explanation "
            "of why this scholarship matches (or doesn't match) the student's profile. "
            "Be specific and grounded — only reference the facts provided. "
            "Do NOT invent any information."
        )

        user = f"""Student profile:
- Nationality: {profile.nationality or "Not specified"}
- Education: {profile.educationLevel or "Not specified"}
- Field of study: {profile.fieldOfStudy or "Not specified"}
- Interests: {", ".join(profile.interests) if profile.interests else "Not specified"}
- Country: {profile.residingCountry or "Not specified"}

Scholarship: {scholarship.title}
- Provider: {scholarship.provider}
- Country: {scholarship.country}
- Level: {scholarship.level}
- Field: {scholarship.fieldOfStudy}
- Value: {scholarship.value}

Match score: {score}/100
Positive reasons: {"; ".join(reasons) if reasons else "None"}
Missing requirements: {"; ".join(missing) if missing else "None"}

Write a concise explanation for the student."""

        return await llm_client.complete(system, user, temperature=0.3, max_tokens=200)

    except Exception as e:
        log.warning("LLM explanation failed: %s", e)
        return _fallback_explanation(scholarship, score, reasons)


def _fallback_explanation(
    scholarship: ScholarshipRecord,
    score: int,
    reasons: list[str],
) -> str:
    """Generate a simple explanation without the LLM."""
    if score >= 70:
        strength = "strong"
    elif score >= 40:
        strength = "moderate"
    else:
        strength = "weak"

    parts = [f"{scholarship.title} is a {strength} match for your profile."]
    if reasons:
        parts.append(f"Key factors: {'; '.join(reasons[:3])}.")
    return " ".join(parts)
