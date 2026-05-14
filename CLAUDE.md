# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Deep Thinker** - a full-stack AI research agent. Users submit a question; the backend decomposes it into parallel research threads (via LangGraph), searches the web (Tavily), summarizes each thread, and synthesizes a final markdown report - all streamed live to the UI via WebSocket.

Monorepo: `frontend/` (Next.js 16 + React 19) and `backend/` (FastAPI + LangGraph).

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
uv run main.py                # dev server on :8000
uv run ruff check .           # lint
uv run ruff format .          # format
uv run pytest                 # run all tests
uv run pytest tests/test_foo.py::test_bar  # single test
```

Entry point is `backend/main.py` (moved from `backend/app/main.py`). All agent logic still lives under `backend/app/`.

Environment variables go in `backend/.env`. Required: `OPENAI_API_KEY` (or `GROQ_API_KEY`), `TAVILY_API_KEY`. LLM selection via `LLM_PROVIDER` and `LLM_MODEL`.

---

## Architecture

### Backend - LangGraph Pipeline (`backend/app/`)

Core: a **LangGraph `StateGraph`** (`app/graph.py`) with four nodes:

```
START → planner → [Send fan-out] → researcher ×N (parallel)
                                           ↓ (merge via reducer)
                                       summarizer
                                           ↓
                                       synthesizer → END
```

**State** (`app/state.py`): TypedDict - `query`, `session_id`, `subtopics: list[str]`, `results: list[SubtopicResult]` (merged via `add_results` reducer), `report: str`.

**Agents** (`app/agents/`):
- **planner** - LLM call → JSON array of 3-5 subtopic strings
- **researcher** - tool-calling loop with `tavily_search`; one per subtopic via `Send`
- **summarizer** - LLM summarizes raw search results per subtopic
- **synthesizer** - LLM streams the final markdown report

**LLM Service** (`app/services/llm.py`): wraps `langchain-openai.ChatOpenAI`; Groq supported via `base_url`. Configured by `app/config.py` (Pydantic Settings).

**API** (`backend/main.py`): 5 REST endpoints + 1 WebSocket. Sessions are **in-memory only** - they do not persist across restarts.

WebSocket events pushed to client:
```
PLAN_CREATED | SEARCH_DONE | SOURCES_COLLECTED |
SUMMARY_CHUNK | SUMMARY_DONE | REPORT_CHUNK | REPORT_DONE | ERROR
```

### Frontend - Next.js 16 + React 19 (`frontend/src/`)

> **Warning**: This uses Next.js 16, which has breaking changes from earlier versions. Before touching routing, layouts, or server components, read the relevant guide in `node_modules/next/dist/docs/`.

**Design System - semi-dark brown / warm dark palette:**
- Background: `#0e0b09` (dark warm brown-black)
- Dot-grid: `rgba(180, 83, 9, 0.07)` amber-brown
- Primary accent: `amber-600/700` (`#d97706` / `#b45309`)
- Active agent: amber glow with animated border pulse
- Completed state: `lime-700`
- Error state: `rose-700`
- Text: `stone-*` scale (warm brown-grays)
- Borders: `stone-700`, scrollbar `rgba(180, 83, 9, 0.3)`

**Layout (`page.tsx`):**
```
┌──────────────────────────────────────────────────────────────────┐
│  [DT] DEEP THINKER · AI RESEARCH AGENT    [status] [Sessions]    │
├──────────────────────────────────────────────────────────────────┤
│  CommandBar: query input + "ANALYZE →" pill gradient button      │
├──────────────────────────────┬───────────────────────────────────┤
│  THINKING STREAM (55%)       │  RESEARCH SOURCES (45%)           │
│  Timeline-style event log    │  Tabbed by subtopic, source cards │
├──────────────────────────────┴───────────────────────────────────┤
│  AGENT PIPELINE: [Planner]──[Researcher ×N]──[Summarizer]──[Syn] │
├──────────────────────────────────────────────────────────────────┤
│  DEEP ANALYSIS (inline, animates in on completion)               │
└──────────────────────────────────────────────────────────────────┘
```

**Key structural differences from a typical layout:**
- No left sidebar - agent status is a **horizontal pipeline bar** below the main content (`AgentPipeline.tsx`)
- Report is **inline** (animated slide-in section) - not a modal/dialog
- Sessions panel opens as a **left Sheet** from the header, not a bottom drawer
- Status lives **in the header** alongside the session button

**State** (`store/useResearchStore.ts`): Zustand store - `sessionId`, `query`, `events[]`, `subtopics[]`, `sources{}`, `reportChunks[]`, `agentStatuses{}`, `isRunning`.

**API layer** (`lib/api.ts`): HTTP → `/api/*` (proxied by Next.js rewrite to backend). `API_URL` env var controls the target.

**Key components** (`components/`):
- `CommandBar` - `border-2 border-stone-600` input (visible at rest); placeholder rotates every 5s at 65% opacity; submit is a `rounded-full` pill with `from-amber-800 to-orange-700` gradient and reads "ANALYZE →"; shows "ANALYZING ◌" while running
- `AgentPipeline` - horizontal 4-node timeline with connecting lines; amber glow/pulse on active node; `lime-700` on done; subtopic count badge on researcher node
- `LogStream` - vertical timeline with left-side dot track; each event in a warm-toned card (`amber/orange/lime/yellow/rose`); agent + subtopic chips per entry
- `SourcesPanel` - tab per subtopic (`amber-700` active); source cards with `amber-700` score bar; "open ↗" link appears on hover
- `ReportViewer` - inline markdown with warm brown prose overrides; `amber-600` streaming cursor; copy + export buttons when done
- `SessionDrawer` - left-side Sheet from header button; `lime-600` done / `amber-500` running status colors; hover-reveal delete button
- `StatusBar` - amber pill in header; shows active agent name while running

**TypeScript path alias**: `@/*` → `src/*`

**Styling**: Tailwind CSS v4 via PostCSS. Prettier: 100-char width, `prettier-plugin-tailwindcss`.
