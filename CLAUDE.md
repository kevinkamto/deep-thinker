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
- **planner** - LLM call → JSON array of 3–5 subtopic strings
- **researcher** - tool-calling loop with `tavily_search`; one per subtopic via `Send`
- **summarizer** - LLM summarizes raw search results per subtopic
- **synthesizer** - LLM streams the final markdown report

**LLM Service** (`app/services/llm.py`): wraps `langchain-openai.ChatOpenAI`; Groq supported via `base_url`. Configured by `app/config.py` (Pydantic Settings).

**API** (`app/main.py`): 5 REST endpoints + 1 WebSocket. Sessions are **in-memory only** - they do not persist across restarts.

WebSocket events pushed to client:
```
PLAN_CREATED | SEARCH_DONE | SOURCES_COLLECTED |
SUMMARY_CHUNK | SUMMARY_DONE | REPORT_CHUNK | REPORT_DONE | ERROR
```

### Frontend - Next.js 16 + React 19 (`frontend/src/`)

> **Warning**: This uses Next.js 16, which has breaking changes from earlier versions. Before touching routing, layouts, or server components, read the relevant guide in `node_modules/next/dist/docs/`.

**Design System - amber/warm dark palette:**
- Background: `#09090f` with amber dot-grid (`globals.css`)
- Primary accent: `amber-400/500` (`#fbbf24` / `#f59e0b`)
- Active agent glow: amber
- Completed state: `emerald-500`
- Error state: `rose-500`
- Text: `stone-*` scale (warm grays) rather than `zinc-*`
- Scrollbar, borders, and grid lines all use amber at low opacity

**Layout (page.tsx):**
```
┌─────────────────────────────────────────────────────────────────┐
│  [DT] DEEP THINKER · AI RESEARCH AGENT    [status] [Sessions]   │
├─────────────────────────────────────────────────────────────────┤
│  CommandBar: query input + "THINK DEEP ▶" button                │
├──────────────────────────────┬──────────────────────────────────┤
│  THINKING STREAM (55%)       │  RESEARCH SOURCES (45%)          │
│  Timeline-style event log    │  Tabbed by subtopic, source cards │
├──────────────────────────────┴──────────────────────────────────┤
│  AGENT PIPELINE: [Planner]──[Researcher ×N]──[Summarizer]──[Syn]│
├─────────────────────────────────────────────────────────────────┤
│  DEEP ANALYSIS (inline, animates in on completion)              │
└─────────────────────────────────────────────────────────────────┘
```

**Key structural differences from a typical layout:**
- No left sidebar - agent status is a **horizontal pipeline bar** below the main content (`AgentPipeline.tsx`)
- Report is **inline** (animated slide-in section) - not a modal/dialog
- Sessions panel opens as a **left Sheet** from the header, not a bottom drawer
- Status lives **in the header** alongside the session button

**State** (`store/useResearchStore.ts`): Zustand store - `sessionId`, `query`, `events[]`, `subtopics[]`, `sources{}`, `reportChunks[]`, `agentStatuses{}`, `isRunning`.

**API layer** (`lib/api.ts`): HTTP → `/api/*` (proxied by Next.js rewrite to backend). `API_URL` env var controls the target.

**Key components** (`components/`):
- `CommandBar` - amber-accented input; placeholder rotates every 5 s; button reads "THINK DEEP ▶"; animates while running
- `AgentPipeline` - horizontal 4-node timeline with connecting lines; amber glow on active node; emerald on done; subtopic badge on researcher node
- `LogStream` - vertical timeline with left-side dot track; each event in a colored card (`amber/sky/emerald/orange/rose`); subtopic chips on entries
- `SourcesPanel` - tab per subtopic with animated source cards; score shown as animated amber bar; "open ↗" link appears on hover
- `ReportViewer` - inline markdown with warm prose overrides; amber streaming cursor; copy + export buttons when done
- `SessionDrawer` - left-side Sheet from header button; hover-reveal delete button
- `StatusBar` - amber pill in header; shows active agent name while running

**TypeScript path alias**: `@/*` → `src/*`

**Styling**: Tailwind CSS v4 via PostCSS. Prettier: 100-char width, `prettier-plugin-tailwindcss`.
