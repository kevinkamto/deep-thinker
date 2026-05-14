"use client"

import { useEffect, useRef } from "react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { useResearchStore } from "@/store/useResearchStore"
import type { EventType, WSEvent } from "@/types/events"
import { ScrollArea } from "@/components/ui/scroll-area"

const EVENT_STYLE: Record<EventType, { color: string; bg: string; icon: string }> = {
  PLAN_CREATED:      { color: "text-blue-300",   bg: "bg-blue-500/10",   icon: "◈" },
  SEARCH_DONE:       { color: "text-sky-400",     bg: "bg-sky-500/10",    icon: "⌕" },
  SOURCES_COLLECTED: { color: "text-teal-400",    bg: "bg-teal-500/10",   icon: "◎" },
  SUMMARY_CHUNK:     { color: "text-indigo-400",  bg: "bg-indigo-500/10", icon: "◑" },
  SUMMARY_DONE:      { color: "text-indigo-300",  bg: "bg-indigo-500/8",  icon: "◉" },
  REPORT_CHUNK:      { color: "text-blue-400",    bg: "bg-blue-500/10",   icon: "◆" },
  REPORT_DONE:       { color: "text-blue-300",    bg: "bg-blue-500/12",   icon: "◆" },
  ERROR:             { color: "text-rose-400",    bg: "bg-rose-500/10",   icon: "✗" },
}

function eventLabel(event: EventType, data: Record<string, unknown>, subtopic?: string): string {
  switch (event) {
    case "PLAN_CREATED":
      return `Research plan created - ${(data.subtopics as string[])?.length ?? 0} parallel threads`
    case "SEARCH_DONE":
      return `Web search complete${subtopic ? ` · ${subtopic}` : ""}`
    case "SOURCES_COLLECTED":
      return `Sources collected${subtopic ? ` · ${subtopic}` : ""} - ${data.count ?? 0} results`
    case "SUMMARY_CHUNK":
      return `Distilling findings${subtopic ? ` · ${subtopic}` : ""}...`
    case "SUMMARY_DONE":
      return `Thread complete${subtopic ? ` · ${subtopic}` : ""}`
    case "REPORT_CHUNK":
      return `Synthesizing deep analysis...`
    case "REPORT_DONE":
      return `Deep analysis ready`
    case "ERROR":
      return `Error: ${(data.message as string) ?? "unknown"}`
    default:
      return event
  }
}

function EventDetail({ e }: { e: WSEvent }) {
  switch (e.event) {
    case "PLAN_CREATED": {
      const subtopics = (e.data.subtopics as string[]) ?? []
      if (!subtopics.length) return null
      return (
        <ul className="mt-1 space-y-0.5">
          {subtopics.map((t, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="mt-px shrink-0 text-blue-600">›</span>
              <span className="text-slate-400">{t}</span>
            </li>
          ))}
        </ul>
      )
    }
    case "SEARCH_DONE": {
      const q = e.data.query as string | undefined
      const count = (e.data.results_count ?? e.data.count) as number | undefined
      if (!q && count == null) return null
      return (
        <p className="text-slate-500">
          {q && <span className="text-slate-400">"{q}"</span>}
          {count != null && <span className="ml-2">{count} results</span>}
        </p>
      )
    }
    case "SOURCES_COLLECTED": {
      const sources = (e.data.sources as Array<{ title: string; url: string }>) ?? []
      if (!sources.length) return null
      return (
        <ul className="mt-1 space-y-0.5">
          {sources.slice(0, 3).map((s, i) => (
            <li key={i} className="flex min-w-0 items-start gap-1.5">
              <span className="mt-px shrink-0 text-teal-700">·</span>
              <span className="truncate text-slate-500">
                {s.title ||
                  (() => {
                    try { return new URL(s.url).hostname } catch { return s.url }
                  })()}
              </span>
            </li>
          ))}
          {sources.length > 3 && (
            <li className="text-slate-600">+{sources.length - 3} more</li>
          )}
        </ul>
      )
    }
    case "SUMMARY_CHUNK": {
      const chunk = (e.data.chunk as string) ?? ""
      return chunk ? <p className="line-clamp-2 text-slate-500">{chunk}</p> : null
    }
    case "REPORT_DONE": {
      const report = (e.data.report as string) ?? ""
      if (!report) return null
      return (
        <p className="text-slate-500">{report.trim().split(/\s+/).length.toLocaleString()} words synthesized</p>
      )
    }
    case "ERROR": {
      const msg = e.data.message as string | undefined
      return msg ? <p className="wrap-break-word text-rose-500/80">{msg}</p> : null
    }
    default:
      return null
  }
}

export default function LogStream() {
  const events = useResearchStore((s) => s.events)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [events])

  const filtered = events.filter((e) => e.event !== "REPORT_CHUNK")

  if (filtered.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-600">
          ◈
        </div>
        <p className="font-mono text-xs text-slate-600">Awaiting your query...</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="relative space-y-0 pr-2">
        {/* Timeline vertical line */}
        <div className="absolute top-0 bottom-0 left-[1.15rem] w-px bg-slate-700/50" />

        <AnimatePresence initial={false}>
          {filtered.map((e, i) => {
            const style = EVENT_STYLE[e.event]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="relative flex items-start gap-3 py-2 pl-1"
              >
                {/* Timeline dot */}
                <div
                  className={`relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-950 font-mono text-[10px] ${style.color}`}
                >
                  {style.icon}
                </div>

                {/* Content card */}
                <div className={`min-w-0 flex-1 rounded-lg p-2.5 font-mono text-[11px] ${style.bg}`}>
                  <div className="flex items-center gap-2">
                    <span className={`shrink-0 font-semibold ${style.color}`}>
                      {eventLabel(e.event, e.data, e.subtopic)}
                    </span>
                    <span className="ml-auto shrink-0 text-slate-600">
                      {format(new Date(e.timestamp), "HH:mm:ss")}
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] leading-relaxed">
                    <EventDetail e={e} />
                  </div>
                  <div className="mt-1.5 flex items-center gap-1">
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-500">
                      {e.agent}
                    </span>
                    {e.subtopic && (
                      <span className="rounded bg-blue-950/50 px-1.5 py-0.5 text-[9px] text-blue-600">
                        {e.subtopic.slice(0, 30)}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
