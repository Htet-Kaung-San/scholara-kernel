"""
Content parser — extracts clean text from HTML pages and PDFs.
"""

from __future__ import annotations

import io
import logging
from typing import Optional

from app.utils.text import clean_text, truncate

log = logging.getLogger(__name__)


def parse_html(raw_html: str) -> str:
    """
    Extract the main textual content from an HTML page.
    Uses trafilatura (best for articles/main content) with BeautifulSoup fallback.
    """
    # Try trafilatura first — it's excellent at extracting main content
    try:
        import trafilatura

        result = trafilatura.extract(raw_html, include_comments=False, include_tables=True)
        if result and len(result) > 100:
            return truncate(clean_text(result))
    except Exception as e:
        log.debug("trafilatura failed, falling back to BS4: %s", e)

    # Fallback: BeautifulSoup
    try:
        from bs4 import BeautifulSoup

        soup = BeautifulSoup(raw_html, "lxml")

        # Remove script/style
        for tag in soup.find_all(["script", "style", "nav", "footer", "header"]):
            tag.decompose()

        text = soup.get_text(separator=" ", strip=True)
        return truncate(clean_text(text))
    except Exception as e:
        log.warning("HTML parsing failed: %s", e)
        return ""


def parse_pdf(raw_bytes: str) -> str:
    """
    Extract text from a PDF.
    Expects raw_bytes as a latin-1 encoded string (from fetch.py).
    """
    try:
        from pypdf import PdfReader

        byte_data = raw_bytes.encode("latin-1")
        reader = PdfReader(io.BytesIO(byte_data))

        pages: list[str] = []
        for page in reader.pages[:20]:  # Limit to first 20 pages
            text = page.extract_text() or ""
            if text.strip():
                pages.append(text)

        full_text = "\n\n".join(pages)
        return truncate(clean_text(full_text))
    except Exception as e:
        log.warning("PDF parsing failed: %s", e)
        return ""


def parse_content(raw: str, url: str) -> str:
    """
    Auto-detect content type and parse accordingly.
    """
    if url.lower().endswith(".pdf") or raw[:5] == "%PDF-":
        return parse_pdf(raw)
    return parse_html(raw)
