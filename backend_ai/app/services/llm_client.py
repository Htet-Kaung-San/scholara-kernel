"""
Unified LLM client — supports OpenAI and Anthropic.

Used for:
1. Structured JSON extraction (scholarship data from web pages)
2. Grounded explanation generation (match reasons)
"""

from __future__ import annotations

import json
import logging
from typing import Any, Optional

from app.core.config import LLMProvider, settings

log = logging.getLogger(__name__)


async def complete(
    system_prompt: str,
    user_prompt: str,
    *,
    json_mode: bool = False,
    temperature: float = 0.1,
    max_tokens: int = 4096,
) -> str:
    """
    Send a prompt to the configured LLM and return the text response.

    Args:
        system_prompt: System-level instructions.
        user_prompt: The user message / content to process.
        json_mode: If True, request JSON output from the model.
        temperature: Sampling temperature (low = deterministic).
        max_tokens: Maximum response tokens.

    Returns:
        The model's text response.
    """
    provider = settings.llm_provider

    if provider == LLMProvider.OPENAI:
        return await _openai_complete(
            system_prompt, user_prompt,
            json_mode=json_mode,
            temperature=temperature,
            max_tokens=max_tokens,
        )
    elif provider == LLMProvider.ANTHROPIC:
        return await _anthropic_complete(
            system_prompt, user_prompt,
            json_mode=json_mode,
            temperature=temperature,
            max_tokens=max_tokens,
        )
    else:
        raise ValueError(f"Unsupported LLM provider: {provider}")


async def complete_json(
    system_prompt: str,
    user_prompt: str,
    *,
    temperature: float = 0.0,
    max_tokens: int = 4096,
) -> dict[str, Any]:
    """
    Send a prompt and parse the response as JSON.
    Raises ValueError if the response is not valid JSON.
    """
    raw = await complete(
        system_prompt, user_prompt,
        json_mode=True,
        temperature=temperature,
        max_tokens=max_tokens,
    )

    # Strip markdown fences if present
    text = raw.strip()
    if text.startswith("```"):
        # Remove ```json and trailing ```
        lines = text.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        text = "\n".join(lines)

    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        log.error("LLM returned invalid JSON: %s\nRaw: %s", e, raw[:500])
        raise ValueError(f"LLM returned invalid JSON: {e}") from e


# ─── OpenAI ───────────────────────────────────


async def _openai_complete(
    system_prompt: str,
    user_prompt: str,
    *,
    json_mode: bool = False,
    temperature: float = 0.1,
    max_tokens: int = 4096,
) -> str:
    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=settings.llm_api_key)

    kwargs: dict[str, Any] = {
        "model": settings.llm_model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    log.debug("OpenAI request: model=%s, json_mode=%s", settings.llm_model, json_mode)
    response = await client.chat.completions.create(**kwargs)

    content = response.choices[0].message.content or ""
    log.debug("OpenAI response length: %d chars", len(content))
    return content


# ─── Anthropic ────────────────────────────────


async def _anthropic_complete(
    system_prompt: str,
    user_prompt: str,
    *,
    json_mode: bool = False,
    temperature: float = 0.1,
    max_tokens: int = 4096,
) -> str:
    from anthropic import AsyncAnthropic

    client = AsyncAnthropic(api_key=settings.llm_api_key)

    # Anthropic doesn't have a native JSON mode — we enforce via prompt
    if json_mode:
        system_prompt += (
            "\n\nIMPORTANT: You MUST respond with valid JSON only. "
            "No markdown, no explanation, no text outside the JSON object."
        )

    log.debug("Anthropic request: model=%s, json_mode=%s", settings.llm_model, json_mode)
    response = await client.messages.create(
        model=settings.llm_model,
        max_tokens=max_tokens,
        temperature=temperature,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
    )

    content = response.content[0].text if response.content else ""
    log.debug("Anthropic response length: %d chars", len(str(content)))
    return str(content)
