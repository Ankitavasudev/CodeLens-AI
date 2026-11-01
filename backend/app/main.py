"""CodeLens AI backend.

Two surfaces share one app:

* `/api/analyze`, `/api/share`, `/api/snippet/{id}`, `/api/templates` — the
  keyless playground the single-page frontend uses.
* `/api/auth/*`, `/api/review/*`, `/api/github/*` — the account-backed layer
  (SQLite + JWT) mounted from `app/routes`.

The OpenAI client is created lazily, so the app boots without a key and returns
a readable 503 instead of crashing on import.
"""

from __future__ import annotations

import os
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import AsyncOpenAI
from pydantic import BaseModel, Field

from app.config import get_settings
from app.core import (
    MODES,
    CodeValidationError,
    SnippetStore,
    build_messages,
    normalise_mode,
    parse_model_json,
    validate_code,
)
from app.routes import auth, github, review

settings = get_settings()

snippets = SnippetStore(ttl_seconds=3600, max_items=500)
_client: AsyncOpenAI | None = None


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Local SQLite only; no migrations needed for a demo schema of two tables.
    from app.database import Base, engine
    from app.models import Review, User  # noqa: F401  (register models)

    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI code review, explanation, refactor and language conversion.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(review.router)
app.include_router(github.router)


def get_client() -> AsyncOpenAI:
    """Build the OpenAI client on first use; fail with 503 when unconfigured."""
    global _client
    if _client is not None:
        return _client
    api_key = os.getenv("OPENAI_API_KEY") or settings.OPENAI_API_KEY
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="OPENAI_API_KEY is not configured. Set it in backend/.env to use the AI endpoints.",
        )
    _client = AsyncOpenAI(api_key=api_key)
    return _client


class CodeRequest(BaseModel):
    code: str = Field(..., min_length=1, max_length=50_000)
    language: str = "python"
    mode: str = "review"


class ShareRequest(BaseModel):
    code: str = Field(..., min_length=1, max_length=50_000)
    language: str = "python"
    title: str = Field("Untitled", max_length=120)


TEMPLATES = [
    {"name": "Hello World", "language": "python", "code": 'print("Hello, World!")'},
    {
        "name": "FizzBuzz",
        "language": "python",
        "code": (
            "for i in range(1, 101):\n"
            "    if i % 15 == 0:\n        print('FizzBuzz')\n"
            "    elif i % 3 == 0:\n        print('Fizz')\n"
            "    elif i % 5 == 0:\n        print('Buzz')\n"
            "    else:\n        print(i)"
        ),
    },
    {
        "name": "Binary Search",
        "language": "python",
        "code": (
            "def binary_search(arr, target):\n"
            "    left, right = 0, len(arr) - 1\n"
            "    while left <= right:\n"
            "        mid = (left + right) // 2\n"
            "        if arr[mid] == target:\n            return mid\n"
            "        elif arr[mid] < target:\n            left = mid + 1\n"
            "        else:\n            right = mid - 1\n"
            "    return -1"
        ),
    },
]


@app.get("/api/health")
def health() -> dict:
    return {
        "status": "ok",
        "version": settings.APP_VERSION,
        "ai_configured": bool(os.getenv("OPENAI_API_KEY") or settings.OPENAI_API_KEY),
        "modes": list(MODES),
    }


@app.post("/api/analyze")
async def analyze(req: CodeRequest) -> dict:
    try:
        validate_code(req.code)
    except CodeValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    client = get_client()
    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=build_messages(req.mode, req.language, req.code),
            temperature=0.3,
            response_format={"type": "json_object"},
        )
    except Exception as exc:  # upstream timeout, quota, bad key...
        raise HTTPException(status_code=502, detail=f"AI provider error: {exc}") from exc

    content = response.choices[0].message.content or ""
    try:
        return parse_model_json(content)
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=f"Unparseable model response: {exc}") from exc


@app.post("/api/share")
def share(req: ShareRequest) -> dict:
    sid = uuid.uuid4().hex[:10]
    snippets.add(
        {"code": req.code, "language": req.language, "title": req.title},
        snippet_id=sid,
    )
    return {"id": sid, "url": f"/view/{sid}", "expires_in": snippets.ttl_seconds}


@app.get("/api/snippet/{sid}")
def get_snippet(sid: str) -> dict:
    snippet = snippets.get(sid)
    if snippet is None:
        raise HTTPException(status_code=404, detail="Snippet not found or expired")
    return snippet


@app.get("/api/templates")
def templates() -> list[dict]:
    return TEMPLATES


@app.get("/")
def root() -> dict:
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/api/health",
    }
