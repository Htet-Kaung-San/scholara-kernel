"""
Date parsing and comparison utilities.
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from dateutil import parser as dateutil_parser


def parse_date(value: str | None) -> Optional[date]:
    """
    Parse a date string into a date object.
    Returns None if parsing fails or value is empty.
    """
    if not value or not value.strip():
        return None

    try:
        return dateutil_parser.parse(value.strip()).date()
    except (ValueError, OverflowError):
        return None


def is_expired(deadline: date | str | None) -> bool:
    """Return True if the deadline is in the past."""
    if deadline is None:
        return False

    if isinstance(deadline, str):
        deadline = parse_date(deadline)
        if deadline is None:
            return False

    return deadline < date.today()


def days_until(deadline: date | str | None) -> Optional[int]:
    """Return the number of days until the deadline, or None."""
    if deadline is None:
        return None

    if isinstance(deadline, str):
        deadline = parse_date(deadline)
        if deadline is None:
            return None

    return (deadline - date.today()).days
