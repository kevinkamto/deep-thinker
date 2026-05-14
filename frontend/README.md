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

## UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ◉ DEEP THINKER                    [Sessions] · [status]        │
├─────────────────────────────────────────────────────────────────┤
│  What do you want to know?  ________________________  [THINK ▶] │
├──────────────────────────────┬──────────────────────────────────┤
│  THINKING STREAM             │  RESEARCH SOURCES                │
│  (live event log, 55%)       │  (tabbed by subtopic, 45%)       │
│                              │                                   │
├──────────────────────────────┴──────────────────────────────────┤
│  [Planner ●─── Researcher ×N ●─── Summarizer ─── Synthesizer]  │
├─────────────────────────────────────────────────────────────────┤
│  ↓ DEEP ANALYSIS REPORT (inline, slides in on completion)       │
└─────────────────────────────────────────────────────────────────┘
```

## Components

| Component          | Description                                                  |
| ------------------ | ------------------------------------------------------------ |
| `CommandBar`       | Query input with animated placeholder, amber accent          |
| `AgentPipeline`    | Horizontal pipeline timeline: idle → active → done → error  |
| `LogStream`        | Timeline-style live event log, color-coded by event type     |
| `SourcesPanel`     | Tabbed by subtopic, source cards with domain badge and score |
| `ReportViewer`     | Inline streaming markdown renderer, slides in on completion  |
| `SessionDrawer`    | Slide-in panel of past sessions, triggered from header       |
| `StatusBar`        | Embedded in header: active agent, event count, source count  |

## State

Zustand store `useResearchStore` holds: `session`, `events[]`, `sources{}`, `reportChunks[]`, `agentStatuses{}`, `subtopics[]`, `isRunning`.

## Lint

```bash
pnpm lint
pnpm format:check
```
