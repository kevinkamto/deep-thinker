# Deep Thinker - Frontend

Next.js 16 frontend for the Deep Thinker AI research agent.

## Stack

| Layer      | Technology                  |
| ---------- | --------------------------- |
| Framework  | Next.js 16 + React 19       |
| Language   | TypeScript                  |
| Styling    | Tailwind CSS v4             |
| UI         | Radix UI + Lucide React     |
| Animations | Framer Motion               |
| State      | Zustand                     |
| Markdown   | react-markdown + remark-gfm |
| Dates      | date-fns                    |

## Prerequisites

- Node.js 20+
- pnpm

## Setup

```bash
pnpm install
cp .env.example .env.local  # set API URL
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Run

```bash
pnpm dev        # dev server → http://localhost:3000
pnpm build      # production build
pnpm lint       # ESLint
pnpm format     # Prettier
```

## Design System

Semi-dark brown / warm dark palette:

| Token          | Value                                      |
| -------------- | ------------------------------------------ |
| Background     | `#0e0b09` (dark warm brown-black)          |
| Grid           | amber-brown dot-grid `rgba(180,83,9,0.07)` |
| Primary accent | `amber-600/700` — `#d97706` / `#b45309`    |
| Active state   | amber glow + animated border pulse         |
| Done state     | `lime-700`                                 |
| Error state    | `rose-700`                                 |
| Text scale     | `stone-*` (warm brown-grays)               |

## UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [DT] DEEP THINKER · AI RESEARCH AGENT    [status] [Sessions]   │
├─────────────────────────────────────────────────────────────────┤
│  CommandBar: query input + "ANALYZE →" pill gradient button     │
├──────────────────────────────┬──────────────────────────────────┤
│  THINKING STREAM (55%)       │  RESEARCH SOURCES (45%)          │
│  Timeline-style event log    │  Tabbed by subtopic, source cards │
├──────────────────────────────┴──────────────────────────────────┤
│  [Planner ●─── Researcher ×N ●─── Summarizer ─── Synthesizer]  │
├─────────────────────────────────────────────────────────────────┤
│  DEEP ANALYSIS (inline, slides in on completion)                │
└─────────────────────────────────────────────────────────────────┘
```

## Components

| Component       | Description                                                                  |
| --------------- | ---------------------------------------------------------------------------- |
| `CommandBar`    | Visible `border-2 border-stone-600` input; "ANALYZE →" pill gradient button  |
| `AgentPipeline` | Horizontal 4-node timeline; amber pulse on active; lime on done              |
| `LogStream`     | Vertical timeline with dot track; warm-toned event cards                     |
| `SourcesPanel`  | Tabs by subtopic; source cards with amber score bar; hover-reveal link        |
| `ReportViewer`  | Inline streaming markdown; amber cursor; copy + export when done             |
| `SessionDrawer` | Left Sheet from header; hover-reveal delete                                  |
| `StatusBar`     | Amber pill in header; shows active agent while running                       |

## State

Zustand store `useResearchStore` holds: `sessionId`, `query`, `events[]`, `subtopics[]`, `sources{}`, `reportChunks[]`, `agentStatuses{}`, `isRunning`.

## Lint

```bash
pnpm lint
pnpm format:check
```
