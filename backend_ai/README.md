# Scholara AI Service

AI-powered scholarship matching and discovery microservice for [Scholara](https://github.com/your-org/scholara-kernel).

Built with **FastAPI** (Python 3.11+) — runs as a separate service on `http://localhost:8001`.

## Architecture

```
Express Backend ──(HTTP + X-INTERNAL-KEY)──▶ Scholara AI Service
                                              ├── POST /match         (rank scholarships for user)
                                              └── POST /admin/discover (find new scholarships from web)
```

| Layer | Purpose |
|---|---|
| `app/api/` | FastAPI route handlers |
| `app/services/` | Business logic (matcher, extraction, validation, search, fetch, parse) |
| `app/schemas/` | Pydantic models (request/response contracts) |
| `app/core/` | Config, security, logging |
| `app/utils/` | Date parsing, text utilities |

## Quick Start

```bash
# 1. Create virtual environment
cd backend_ai
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 4. Run the server
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

The service will be available at `http://localhost:8001`. Check health: `curl http://localhost:8001/health`.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `INTERNAL_API_KEY` | ✅ | Shared secret with Express backend |
| `LLM_PROVIDER` | ✅ | `openai` or `anthropic` |
| `LLM_API_KEY` | ✅ | API key for LLM provider |
| `LLM_MODEL` | | Model name (default: `gpt-4o-mini`) |
| `SEARCH_PROVIDER` | | `tavily`, `serpapi`, `brave`, or `none` |
| `SEARCH_API_KEY` | | API key for search provider |
| `FETCH_TIMEOUT_SECONDS` | | URL fetch timeout (default: `15`) |
| `HOST` | | Bind host (default: `0.0.0.0`) |
| `PORT` | | Bind port (default: `8001`) |
| `LOG_LEVEL` | | `debug`, `info`, `warning` (default: `info`) |

## Endpoints

### `GET /health`
No auth required. Returns `{ ok: true, version: "0.1.0" }`.

### `POST /match`
Requires `X-INTERNAL-KEY` header.  
Ranks verified scholarships for a user profile using deterministic scoring + LLM explanations.

### `POST /admin/discover`
Requires `X-INTERNAL-KEY` header.  
Discovers new scholarship candidates from the web. Does NOT write to DB — returns proposals for admin review.

See [docs/INTEGRATION.md](docs/INTEGRATION.md) for full request/response examples.

## Key Design Decisions

1. **LLM as extractor + narrator, not database** — Deterministic rules handle all scoring and gating. LLM only extracts structured data from web pages and generates grounded explanations.

2. **Evidence spans** — Every extracted field must cite the source text quote. This enables admin audit before approval.

3. **Confidence scoring** — Computed deterministically from evidence completeness, field presence, and validation rules. Not an LLM-generated value.

4. **No direct user access** — Users only see verified scholarships from the main DB. Web search is admin-only.

5. **Pluggable providers** — LLM (OpenAI/Anthropic) and search (Tavily/SerpAPI/Brave) providers are swappable via env vars.
