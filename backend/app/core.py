"""Pure helpers for the CodeLens backend.

Everything that does not need FastAPI, OpenAI or a database lives here so it can
be unit tested without network access or credentials.
"""

from __future__ import annotations

import json
import re
import time
from dataclasses import dataclass, field
from typing import Any

MAX_CODE_CHARS = 50_000
MIN_CODE_CHARS = 5

MODES = ("review", "explain", "refactor", "convert")

PROMPTS: dict[str, str] = {
    "review": (
        "Return JSON with keys: score (0-100 integer), summary (one line), "
        "bugs (list of {line, severity: high|medium|low, msg, fix}), "
        "tips (list of {type: perf|security|style, msg})."
    ),
    "explain": (
        "Return JSON with keys: summary (what the code does), "
        "lines (list of {line, code, explain}), concepts (list of strings), "
        "output (expected output or empty string)."
    ),
    "refactor": (
        "Return JSON with keys: improved (the refactored code), "
        "changes (list of strings explaining each change), "
        "complexity (before vs after)."
    ),
    "convert": (
        "Return JSON with keys: converted_code (the code in the target language), "
        "notes (differences worth knowing)."
    ),
}

SYSTEM_RULES = "Return ONLY valid JSON. No markdown fences, no prose outside the JSON object."


class CodeValidationError(ValueError):
    """Raised when submitted code is empty, too short or too large."""


def normalise_mode(mode: str | None) -> str:
    """Unknown modes fall back to `review` instead of failing the request."""
    if isinstance(mode, str) and mode.strip().lower() in PROMPTS:
        return mode.strip().lower()
    return "review"


def validate_code(code: Any, *, min_chars: int = MIN_CODE_CHARS, max_chars: int = MAX_CODE_CHARS) -> str:
    if not isinstance(code, str):
        raise CodeValidationError("code must be a string")
    if len(code.strip()) < min_chars:
        raise CodeValidationError(f"Code too short (min {min_chars} characters)")
    if len(code) > max_chars:
        raise CodeValidationError(f"Code too long (max {max_chars} characters)")
    return code


def build_messages(mode: str, language: str, code: str) -> list[dict[str, str]]:
    prompt = PROMPTS[normalise_mode(mode)]
    return [
        {"role": "system", "content": f"You are CodeLens AI. {prompt}\nRules: {SYSTEM_RULES}"},
        {"role": "user", "content": f"Language: {language or 'text'}\n\n{code}"},
    ]


_FENCE = re.compile(r"^\s*```[a-zA-Z0-9_-]*\s*|\s*```\s*$")


def parse_model_json(text: str) -> dict[str, Any]:
    """Parse model output that may be wrapped in markdown fences or prose."""
    if not isinstance(text, str) or not text.strip():
        raise ValueError("empty model response")

    cleaned = _FENCE.sub("", text.strip())
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        start, end = cleaned.find("{"), cleaned.rfind("}")
        if start == -1 or end <= start:
            raise ValueError("model response contained no JSON object") from None
        data = json.loads(cleaned[start : end + 1])

    if not isinstance(data, dict):
        raise ValueError("model response was not a JSON object")
    return data


@dataclass
class SnippetStore:
    """Bounded, expiring store for share links.

    Deliberately in-memory: share links are a convenience for a demo, not a
    database. They disappear on restart, and the README says so.
    """

    ttl_seconds: int = 3600
    max_items: int = 500
    _items: dict[str, tuple[float, dict[str, Any]]] = field(default_factory=dict)

    def _purge(self, now: float) -> None:
        expired = [key for key, (created, _) in self._items.items() if now - created > self.ttl_seconds]
        for key in expired:
            del self._items[key]
        while len(self._items) >= self.max_items:
            oldest = min(self._items, key=lambda key: self._items[key][0])
            del self._items[oldest]

    def add(self, snippet: dict[str, Any], *, snippet_id: str) -> str:
        now = time.time()
        self._purge(now)
        self._items[snippet_id] = (now, snippet)
        return snippet_id

    def get(self, snippet_id: str) -> dict[str, Any] | None:
        now = time.time()
        entry = self._items.get(snippet_id)
        if entry is None:
            return None
        created, snippet = entry
        if now - created > self.ttl_seconds:
            del self._items[snippet_id]
            return None
        return snippet

    def __len__(self) -> int:
        return len(self._items)
