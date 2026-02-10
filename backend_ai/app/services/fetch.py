"""
HTTP fetcher — downloads web pages with timeout and error handling.
"""

from __future__ import annotations

import logging
from typing import Optional

import httpx

from app.core.config import settings

log = logging.getLogger(__name__)

# Standard browser user-agent to avoid being blocked
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0.0.0 Safari/537.36"
)


async def fetch_url(url: str) -> Optional[str]:
    """
    Fetch the raw content of a URL.

    Returns the response text, or None if the request fails.
    PDF URLs will return raw bytes decoded as latin-1 (handled by parse.py).
    """
    try:
        async with httpx.AsyncClient(
            timeout=settings.fetch_timeout_seconds,
            follow_redirects=True,
            headers={"User-Agent": USER_AGENT},
        ) as client:
            response = await client.get(url)
            response.raise_for_status()

            content_type = response.headers.get("content-type", "")

            if "application/pdf" in content_type:
                # Return raw bytes as latin-1 string for parse.py to handle
                return response.content.decode("latin-1", errors="replace")

            # Default: treat as text/HTML
            return response.text

    except httpx.TimeoutException:
        log.warning("Timeout fetching %s", url)
        return None
    except httpx.HTTPStatusError as e:
        log.warning("HTTP %d fetching %s", e.response.status_code, url)
        return None
    except Exception as e:
        log.warning("Failed to fetch %s: %s", url, e)
        return None
