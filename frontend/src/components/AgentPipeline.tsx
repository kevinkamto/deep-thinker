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
    ring: "border-slate-700",
    dot: "bg-slate-700",
    text: "text-slate-500",
    bg: "bg-slate-900/30",
  },
  active: {
    ring: "border-blue-400",
    dot: "bg-blue-400",
    text: "text-blue-300",
    bg: "bg-blue-950/50",
  },
  done: {
    ring: "border-teal-500",
    dot: "bg-teal-500",
    text: "text-teal-400",
    bg: "bg-teal-950/30",
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
  idle: "bg-slate-800",
  active: "bg-gradient-to-r from-blue-500/60 to-slate-800",
  done: "bg-teal-600/50",
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
            {/* Connector before node */}
            {idx > 0 && (
              <div className={`h-px flex-1 transition-all duration-500 ${connectorStyle}`} />
            )}

            {/* Node */}
            <motion.div
              className={`relative shrink-0 rounded-lg border px-3 py-1.5 transition-all duration-300 ${styles.ring} ${styles.bg}`}
              animate={
                status === "active"
                  ? { borderColor: ["#60a5fa", "#3b82f6", "#60a5fa"] }
                  : {}
              }
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            >
              {/* Active glow */}
              {status === "active" && (
                <motion.div
                  className="absolute inset-0 rounded-lg bg-blue-400/10"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.6 }}
                />
              )}

              <div className="relative flex items-center gap-2">
                <motion.span
                  className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}`}
                  animate={status === "active" ? { scale: [1, 1.6, 1] } : { scale: 1 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
                <div className="min-w-0">
                  <div className={`font-mono text-[11px] font-semibold ${styles.text}`}>
                    {STATUS_ICON[status]} {label}
                  </div>
                  <div className="font-mono text-[9px] text-slate-600">{description}</div>
                </div>
              </div>

              {/* Subtopic count badge on researcher */}
              {name === "researcher" && subtopics.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 font-mono text-[9px] font-bold text-white"
                >
                  {subtopics.length}
                </motion.div>
              )}
            </motion.div>

            {/* Connector after node */}
            {idx < STAGES.length - 1 && (
              <div className={`h-px flex-1 transition-all duration-500 ${CONNECTOR_COLOR[status]}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
