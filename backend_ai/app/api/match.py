"""
POST /match — rank verified scholarships for a user profile.

INTERNAL endpoint: called by Express backend with X-INTERNAL-KEY.
No web calls — operates only on data passed in the request body.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends

from app.core.security import verify_internal_key
from app.schemas.match import MatchRequest, MatchResponse
from app.services.matcher import compute_profile_completeness, rank_scholarships

log = logging.getLogger(__name__)

router = APIRouter(tags=["match"])


@router.post(
    "/match",
    response_model=MatchResponse,
    dependencies=[Depends(verify_internal_key)],
)
async def match_scholarships(req: MatchRequest) -> MatchResponse:
    """
    Rank verified scholarships for a user profile.

    The Express backend sends:
    - The user's profile data
    - A list of scholarship records already in the DB (verified)

    Returns a ranked list with scores, reasons, and explanations.
    No web calls are made — this is a pure scoring + LLM explanation endpoint.
    """
    log.info(
        "Match request: user=%s, scholarships=%d, limit=%d",
        req.user_profile.id,
        len(req.scholarships),
        req.limit,
    )

    matches = await rank_scholarships(
        profile=req.user_profile,
        scholarships=req.scholarships,
        limit=req.limit,
    )

    completeness = compute_profile_completeness(req.user_profile)

    log.info(
        "Match complete: %d results, top_score=%d, profile_completeness=%.0f%%",
        len(matches),
        matches[0].score if matches else 0,
        completeness * 100,
    )

    return MatchResponse(
        matches=matches,
        total_evaluated=len(req.scholarships),
        profile_completeness=completeness,
    )
