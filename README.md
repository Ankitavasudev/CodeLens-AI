<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:05070D,50:141C33,100:3B82F6&height=170&section=header&text=CodeLens%20AI&fontSize=46&fontColor=EAF1F8&fontAlignY=40&desc=Review%2C%20explain%2C%20refactor%2C%20translate&descAlignY=60&descSize=16" width="100%" alt="CodeLens AI" />

**Paste code. Get a structured review — or an explanation, a refactor, or the same code in another language.**

<br />

<img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" />
<img src="https://img.shields.io/badge/Python%203.11-3776AB?style=flat-square&logo=python&logoColor=white" />
<img src="https://img.shields.io/badge/React%2018-20232A?style=flat-square&logo=react&logoColor=61DAFB" />
<img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" />
<img src="https://img.shields.io/badge/tests-31%20passing-3FB950?style=flat-square" />

</div>

---

## What it does

One API, four modes. Every response is constrained to a JSON schema, so the UI renders cards instead of parsing paragraphs of model prose.

| Mode | Returns | Used for |
| :-- | :-- | :-- |
| `review` | `score`, `summary`, `bugs[]` (line, severity, fix), `tips[]` | "What's wrong with this function?" |
| `explain` | `summary`, per-line `lines[]`, `concepts[]`, `output` | Learning an unfamiliar snippet |
| `refactor` | `improved` code, `changes[]`, `complexity` | Cleaning up a draft |
| `convert` | `converted_code`, `notes` | Porting between languages |

Around it:

- **Share links** — `POST /api/share` stores a snippet for one hour and returns a short id.
- **Templates** — a few starter snippets for the playground.
- **Accounts** — register/login (JWT + bcrypt), review history and per-user stats in SQLite, GitHub OAuth login.
- **Docker** — one image, health-checked, with a compose file that keeps the database on a volume.

## Honest scope

This repository previously advertised "real-time analysis as you type", "GitHub PR review automation", "security scanning" and a dashboard screenshot that did not exist. None of that is here. What is here:

- The AI is OpenAI (`gpt-4o-mini` by default). **You need an `OPENAI_API_KEY`**; without one, `/api/analyze` returns a clear `503` instead of crashing, and the rest of the app still boots.
- "Security" findings are whatever the model flags under the `security` tip type. There is no static analyser, no CVE database, no AST pass.
- Share links live in memory: they expire after an hour and vanish on restart. This is a demo convenience, not storage.
- Review history is stored only for authenticated users, in a local SQLite file.
- The frontend under `frontend/src/pages/` is a multi-page shell (landing, login, dashboard) that is **not wired into the router**; the app currently served is the single-page playground in `frontend/src/App.jsx`. The API endpoints those pages call do exist and are tested.

## Quick start

```bash
cd backend
python -m venv .venv && .venv/Scripts/activate      # Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # then add OPENAI_API_KEY=sk-...
uvicorn app.main:app --reload --port 8000
```

Frontend, in a second terminal:

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173, proxies /api to :8000
```

Or the whole backend in Docker:

```bash
docker compose up --build   # http://localhost:8000/docs
```

Interactive API docs: <http://localhost:8000/docs>.

## API

| Method | Endpoint | Auth | Purpose |
| :-- | :-- | :-- | :-- |
| `GET` | `/api/health` | — | Liveness + whether the AI key is configured |
| `POST` | `/api/analyze` | — | `{code, language, mode}` → structured result |
| `POST` | `/api/share` | — | Store a snippet, get a short id (1 h TTL) |
| `GET` | `/api/snippet/{id}` | — | Read a shared snippet |
| `GET` | `/api/templates` | — | Starter snippets |
| `POST` | `/api/auth/register` | — | Create an account, returns a JWT |
| `POST` | `/api/auth/login` | — | OAuth2 password form, returns a JWT |
| `GET` | `/api/auth/me` | Bearer | Current user |
| `GET` | `/api/auth/github` | — | GitHub OAuth authorize URL |
| `POST` | `/api/review/analyze` | Bearer | Review and persist to history |
| `POST` | `/api/review/explain` | Bearer | Explanation |
| `POST` | `/api/review/predict-bugs` | Bearer | Bug-focused review |
| `POST` | `/api/review/chat` | Bearer | Ask a question about the code |
| `GET` | `/api/review/history` | Bearer | Last 50 reviews |
| `GET` | `/api/review/stats` | Bearer | Totals and averages |

```bash
curl -s -X POST localhost:8000/api/analyze \
  -H 'content-type: application/json' \
  -d '{"code":"def f(a,b):\n  return a/b","language":"python","mode":"review"}' | jq
```

## Tests

```bash
cd backend
pytest -q          # 31 tests, no network, no API key
```

- `tests/test_core.py` — validation bounds, mode fallback, prompt construction, JSON recovery from fenced/prefixed model output, snippet store TTL and eviction.
- `tests/test_api.py` — every endpoint, with the OpenAI client stubbed: the 503 path, the 400 path, the 502 path, share/snippet round-trip, register → login → `/me`, duplicate and weak-password rejection, that protected routes really are protected, and that the review service imports without a key and fails with a 503 only when called.

The suite is hermetic: `conftest.py` removes the throwaway SQLite file at the start of
every session, so running `pytest` twice in a row gives the same result.

CI runs the suite on Python 3.11 and builds the Docker image.

## Layout

```
CodeLens-AI/
├── backend/
│   ├── app/
│   │   ├── main.py          # app factory, playground + mounted routers
│   │   ├── core.py          # pure helpers (tested): prompts, JSON, snippets
│   │   ├── config.py        # settings (env / .env)
│   │   ├── database.py      # SQLAlchemy engine + session
│   │   ├── models/          # User, Review
│   │   ├── routes/          # auth, review, github
│   │   ├── services/        # ai_service, github_service
│   │   └── utils/           # bcrypt hashing, JWT
│   ├── tests/
│   └── requirements.txt
├── frontend/                # React + Vite playground
├── Dockerfile
└── docker-compose.yml
```

## Stack

FastAPI · Pydantic v2 · SQLAlchemy 2 · SQLite · JWT · bcrypt · OpenAI SDK · React 18 + Vite · Docker · pytest · GitHub Actions

---

<div align="center">

**Ankita Salaria** · [@Ankitavasudev](https://github.com/Ankitavasudev)

</div>
