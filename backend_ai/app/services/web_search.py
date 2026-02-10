"""
Web search service — admin-only discovery of scholarship URLs.

Pluggable: supports Tavily, SerpAPI, Brave, or none (disabled).
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

import httpx

from app.core.config import SearchProvider, settings

log = logging.getLogger(__name__)


@dataclass
class SearchResult:
    """A single web search result."""

    title: str
    url: str
    snippet: str


async def search(query: str, max_results: int = 10) -> list[SearchResult]:
    """
    Search the web for scholarship-related pages.

    Returns a list of SearchResult objects.
    """
    provider = settings.search_provider

    if provider == SearchProvider.TAVILY:
        return await _tavily_search(query, max_results)
    elif provider == SearchProvider.SERPAPI:
        return await _serpapi_search(query, max_results)
    elif provider == SearchProvider.BRAVE:
        return await _brave_search(query, max_results)
    elif provider == SearchProvider.NONE:
        log.warning("Search provider is 'none' — returning empty results")
        return []
    else:
        raise ValueError(f"Unsupported search provider: {provider}")


# ─── Tavily ───────────────────────────────────


async def _tavily_search(query: str, max_results: int) -> list[SearchResult]:
    """Search using Tavily API."""
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                "https://api.tavily.com/search",
                json={
                    "api_key": settings.search_api_key,
                    "query": query,
                    "max_results": max_results,
                    "search_depth": "advanced",
                    "include_answer": False,
                },
            )
            response.raise_for_status()
            data = response.json()

        results = []
        for item in data.get("results", []):
            results.append(
                SearchResult(
                    title=item.get("title", ""),
                    url=item.get("url", ""),
                    snippet=item.get("content", ""),
                )
            )
        log.info("Tavily returned %d results for: %s", len(results), query)
        return results

    except Exception as e:
        log.error("Tavily search failed: %s", e)
        return []


# ─── SerpAPI ──────────────────────────────────


async def _serpapi_search(query: str, max_results: int) -> list[SearchResult]:
    """Search using SerpAPI."""
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(
                "https://serpapi.com/search",
                params={
                    "api_key": settings.search_api_key,
                    "q": query,
                    "num": max_results,
                    "engine": "google",
                },
            )
            response.raise_for_status()
            data = response.json()

        results = []
        for item in data.get("organic_results", []):
            results.append(
                SearchResult(
                    title=item.get("title", ""),
                    url=item.get("link", ""),
                    snippet=item.get("snippet", ""),
                )
            )
        log.info("SerpAPI returned %d results for: %s", len(results), query)
        return results

    except Exception as e:
        log.error("SerpAPI search failed: %s", e)
        return []


# ─── Brave ────────────────────────────────────


async def _brave_search(query: str, max_results: int) -> list[SearchResult]:
    """Search using Brave Search API."""
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(
                "https://api.search.brave.com/res/v1/web/search",
                params={"q": query, "count": max_results},
                headers={
                    "X-Subscription-Token": settings.search_api_key,
                    "Accept": "application/json",
                },
            )
            response.raise_for_status()
            data = response.json()

        results = []
        for item in data.get("web", {}).get("results", []):
            results.append(
                SearchResult(
                    title=item.get("title", ""),
                    url=item.get("url", ""),
                    snippet=item.get("description", ""),
                )
            )
        log.info("Brave returned %d results for: %s", len(results), query)
        return results

    except Exception as e:
        log.error("Brave search failed: %s", e)
        return []
