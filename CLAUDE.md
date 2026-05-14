# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack AI research assistant — a monorepo with a **Next.js 16 frontend** and a **FastAPI + LangGraph backend**. Users submit a query; the backend decomposes it into subtopics, fans out parallel web-search agents, summarizes each subtopic, and synthesizes a final markdown report — all streamed in real time via WebSocket.

---

## Commands

### Frontend (`frontend/`)

Package manager: **pnpm**

```
pnpm dev            # dev server on :3000
pnpm build          # production build
pnpm lint           # ESLint
pnpm format         # Prettier (write)
pnpm format:check   # Prettier (check only)
```

### Backend (`backend/`)

Package manager: **uv** (Python 3.12+)

```
uv sync                       # install dependencies
uv run python -m app.main     # dev server on :8000
uv run ruff check .           # lint
uv run ruff format .          # format
uv run pytest                 # run all tests
uv run pytest tests/test_foo.py::test_bar  # single test
```

Environment variables are loaded from `backend/.env`. Required keys: `OPENAI_API_KEY` (or `GROQ_API_KEY`), `TAVILY_API_KEY`. LLM provider and model are set via `LLM_PROVIDER` and `LLM_MODEL`.

---

## Architecture

### Backend — LangGraph Pipeline (`backend/app/`)

The core is a **LangGraph `StateGraph`** (`app/graph.py`) with four nodes that run in sequence with a fan-out step:

```
START → planner → [Send fan-out] → researcher ×N (parallel)
                                           ↓ (merge via reducer)
                                       summarizer
                                           ↓
                                       synthesizer → END
```

**State** (`app/state.py`): TypedDict holding `query`, `session_id`, `subtopics: list[str]`, `results: list[SubtopicResult]` (merged via `add_results` reducer), and `report: str`.

**Agents** (`app/agents/`):
- **planner** — LLM call → JSON array of 3–5 subtopic strings
- **researcher** — tool-calling loop with `tavily_search` tool; one instance spawned per subtopic via `Send`
- **summarizer** — LLM summarizes raw search results per subtopic
- **synthesizer** — LLM streams the final markdown report

**LLM Service** (`app/services/llm.py`): wraps `langchain-openai.ChatOpenAI`; Groq is supported by setting `base_url` override. Configured via `app/config.py` (Pydantic Settings).

**API** (`app/main.py`): 5 REST endpoints + 1 WebSocket. Sessions are **in-memory only** — they do not persist across restarts.

WebSocket events pushed to the client:
```
PLAN_CREATED | SEARCH_DONE | SOURCES_COLLECTED |
SUMMARY_CHUNK | SUMMARY_DONE | REPORT_CHUNK | REPORT_DONE | ERROR
```
Each event includes `session_id`, `timestamp`, `agent`, optional `subtopic`, and `data`.

### Frontend — Next.js 16 + React 19 (`frontend/src/`)

> **Warning**: This uses Next.js 16, which has breaking changes from earlier versions. Before touching routing, layouts, or server components, read the relevant guide in `node_modules/next/dist/docs/`.

**State** (`store/useResearchStore.ts`): single Zustand store holds `sessionId`, `query`, `events[]`, `subtopics[]`, `sources{}`, `reportChunks[]`, `agentStatuses{}`. All WebSocket messages dispatch into this store.

**API layer** (`lib/api.ts`): HTTP calls to `/api/*` (proxied by Next.js rewrite to backend) and WebSocket management. The backend URL is configurable via `API_URL` env var.

**Key components** (`components/`):
- `CommandBar` — query input with animated placeholder
- `AgentTraceTree` — live tree showing per-agent state (`idle→active→done→error`)
- `LogStream` — auto-scrolling terminal-style event log
- `SourcesPanel` — sources grouped by subtopic (tabbed)
- `ReportViewer` — streaming markdown renderer
- `SessionDrawer` — session history sidebar
- `StatusBar` — current agent, token count, latency

**TypeScript path alias**: `@/*` → `src/*`

**Styling**: Tailwind CSS v4 via PostCSS; Prettier enforces 100-char line width and the `prettier-plugin-tailwindcss` class ordering.
