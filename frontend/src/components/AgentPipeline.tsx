"use client"

import { motion } from "framer-motion"
import { useResearchStore } from "@/store/useResearchStore"
import type { AgentName, AgentStatus } from "@/types/events"

const STAGES: { name: AgentName; label: string; description: string }[] = [
  { name: "planner", label: "Planner", description: "Decompose query" },
  { name: "researcher", label: "Researcher ×N", description: "Parallel web search" },
  { name: "summarizer", label: "Summarizer", description: "Distill findings" },
  { name: "synthesizer", label: "Synthesizer", description: "Write report" },
]

const NODE_STYLES: Record<AgentStatus, { ring: string; dot: string; text: string; bg: string }> = {
  idle: {
    ring: "border-stone-700",
    dot: "bg-stone-700",
    text: "text-stone-600",
    bg: "bg-stone-900/30",
  },
  active: {
    ring: "border-amber-400",
    dot: "bg-amber-400",
    text: "text-amber-300",
    bg: "bg-amber-950/40",
  },
  done: {
    ring: "border-emerald-500",
    dot: "bg-emerald-500",
    text: "text-emerald-400",
    bg: "bg-emerald-950/30",
  },
  error: {
    ring: "border-rose-500",
    dot: "bg-rose-500",
    text: "text-rose-400",
    bg: "bg-rose-950/30",
  },
}

const STATUS_ICON: Record<AgentStatus, string> = {
  idle: "○",
  active: "◉",
  done: "✓",
  error: "✗",
}

const CONNECTOR_COLOR: Record<AgentStatus, string> = {
  idle: "bg-stone-800",
  active: "bg-gradient-to-r from-amber-500/60 to-stone-800",
  done: "bg-emerald-600/50",
  error: "bg-rose-600/40",
}

export default function AgentPipeline() {
  const { agentStatuses, subtopics } = useResearchStore()

  return (
    <div className="flex items-center gap-0 px-6 py-3">
      {STAGES.map(({ name, label, description }, idx) => {
        const status = agentStatuses[name]
        const styles = NODE_STYLES[status]
        const prevStatus = idx > 0 ? agentStatuses[STAGES[idx - 1].name] : "done"
        const connectorStyle = CONNECTOR_COLOR[prevStatus]

        return (
          <div key={name} className="flex min-w-0 flex-1 items-center">
            {/* Connector line */}
            {idx > 0 && (
              <div className={`h-px flex-1 transition-all duration-500 ${connectorStyle}`} />
            )}

            {/* Node */}
            <motion.div
              className={`relative shrink-0 rounded-lg border px-3 py-1.5 transition-all duration-300 ${styles.ring} ${styles.bg}`}
              animate={
                status === "active"
                  ? { borderColor: ["#fbbf24", "#f59e0b", "#fbbf24"] }
                  : {}
              }
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            >
              {/* Active glow */}
              {status === "active" && (
                <motion.div
                  className="absolute inset-0 rounded-lg bg-amber-400/10"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.6 }}
                />
              )}

              <div className="relative flex items-center gap-2">
                {/* Status dot */}
                <motion.span
                  className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}`}
                  animate={status === "active" ? { scale: [1, 1.6, 1] } : { scale: 1 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />

                <div className="min-w-0">
                  <div className={`font-mono text-[11px] font-semibold ${styles.text}`}>
                    {STATUS_ICON[status]} {label}
                  </div>
                  <div className="font-mono text-[9px] text-stone-600">{description}</div>
                </div>
              </div>

              {/* Subtopic count badge for researcher */}
              {name === "researcher" && subtopics.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 font-mono text-[9px] font-bold text-black"
                >
                  {subtopics.length}
                </motion.div>
              )}
            </motion.div>

            {/* Connector line after last visible node (not after last) */}
            {idx < STAGES.length - 1 && (
              <div className={`h-px flex-1 transition-all duration-500 ${CONNECTOR_COLOR[status]}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
