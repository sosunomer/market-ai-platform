# Market AI Platform

AI-powered market analysis & trading insights platform. Monorepo containing a
FastAPI backend, a React + TypeScript frontend, and Docker Compose infra for
local development.

> **MVP scope**: auth, markets/instruments, price charts, technical indicators,
> company news, AI reports, and a $15/month Stripe subscription. Everything
> works without external API keys via deterministic mock data, so you can develop
> end-to-end offline.

---

## Architecture

```
┌──────────────┐     ┌─────────────────────┐     ┌──────────────┐
│ React + TS   │ ───▶│ FastAPI (Python)    │ ───▶│ PostgreSQL   │
│ Vite + TW    │     │ SQLAlchemy, Alembic │     │ Redis (cache)│
│ LW Charts    │◀─── │ Finnhub / OpenAI /  │     └──────────────┘
└──────────────┘     │ Stripe clients      │
                     └─────────────────────┘
```

Modules:

- **auth / users** — email + password, JWT bearer
- **markets / instruments** — seed data (NASDAQ, NYSE, a few Binance pairs)
- **prices / indicators** — Finnhub (or mock) candles, MA/RSI/MACD
- **news** — company news feed
- **ai** — LLM report (short-term / long-term) and chat
- **subscriptions** — Stripe Checkout with mock mode

---

## Quick start (Docker)

```bash
cp .env.example .env          # optional: fill in real API keys
docker compose up --build
```

Services:

- Frontend: http://localhost:5173
- Backend (OpenAPI docs): http://localhost:8000/docs
- Postgres: localhost:5432 (`market` / `market`)
- Redis: localhost:6379

On first boot the backend runs migrations and seeds markets + instruments.

---

## Local dev without Docker

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
export DATABASE_URL=sqlite+pysqlite:///./dev.db   # or your local postgres URL
alembic upgrade head
python -m app.seed
uvicorn app.main:app --reload
```

Run tests & lint:

```bash
pytest -q
ruff check .
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Environment variables

See [`.env.example`](./.env.example) for the full list. Keys with a blank value
fall back to a local mock:

| Variable                 | Purpose                              | Mock when empty?           |
| ------------------------ | ------------------------------------ | -------------------------- |
| `FINNHUB_API_KEY`        | Real-time prices & company news      | Yes — deterministic OHLCV  |
| `OPENAI_API_KEY`         | LLM reports & chat                   | Yes — templated mock text  |
| `STRIPE_SECRET_KEY` + `STRIPE_PRICE_ID` | $15/mo subscription   | Yes — auto-upgrades user   |

This means you can demo the whole flow (sign up → view chart → generate AI
report → upgrade to premium) without a single external account.

---

## API surface (v0.1)

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

GET  /api/markets
GET  /api/markets/{id}/instruments?search=
GET  /api/instruments/{id}
GET  /api/instruments/{id}/prices?range=1D|1W|1M|3M|1Y&interval=
GET  /api/instruments/{id}/indicators?range=
GET  /api/instruments/{id}/quote
GET  /api/instruments/{id}/news?days=14

POST /api/ai/report       body: { instrument_id, timeframe, mode: short|long }
POST /api/ai/chat         body: { instrument_id?, question }  (premium only)

POST /api/subscriptions/checkout
GET  /api/subscriptions/status

GET  /health
```

---

## What's next (post-MVP)

- WebSocket live quotes (scaffold exists; wire Finnhub WS)
- Multi-market expansion (LSE, BIST, XETRA)
- Celery workers for scheduled news/price ingestion
- Rate limiting + usage quotas per plan
- Deploy: Fly.io (backend) + Vercel (frontend)
