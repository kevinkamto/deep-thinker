# Deep Thinker

A full-stack AI research agent that breaks complex questions into parallel research threads, searches the web, summarizes findings, and synthesizes a final report - all streamed live to the UI.

## Architecture

```
frontend (Next.js 16)  ←→  backend (FastAPI + LangGraph)
                              ↓
              START → planner → [Send ×N] → researcher (parallel)
                                                  ↓ (merge)
                                              summarizer
                                                  ↓
                                              synthesizer → END
```

## Monorepo

| Directory    | Stack                                                |
| ------------ | ---------------------------------------------------- |
| `frontend/`  | Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 |
| `backend/`   | FastAPI + LangGraph + langchain-openai + Tavily      |

## Quick Start

### Backend

```bash
cd backend
uv sync
cp .env.example .env   # fill in OPENAI_API_KEY, TAVILY_API_KEY
uv run python -m app.main
```

### Frontend

```bash
cd frontend
pnpm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL
pnpm dev
```

App runs at `http://localhost:3000`, backend at `http://localhost:8000`.

## Environment Variables

### Backend (`backend/.env`)

```env
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...       # optional, for Groq provider
TAVILY_API_KEY=tvly-...
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```
