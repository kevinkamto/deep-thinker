"use client"

import { motion } from "framer-motion"
import { useResearchStore } from "@/store/useResearchStore"

export default function StatusBar() {
  const { agentStatuses, events, sources, isRunning } = useResearchStore()

  const activeAgent = Object.entries(agentStatuses).find(([, v]) => v === "active")?.[0]
  const sourceCount = Object.values(sources).reduce((acc, s) => acc + s.length, 0)
  const eventCount = events.filter((e) => e.event !== "REPORT_CHUNK").length

  return (
    <div className="flex items-center gap-3 font-mono text-[10px]">
      <div
        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${
          isRunning
            ? "bg-blue-950/60 text-blue-400 ring-1 ring-blue-500/30"
            : "bg-slate-800 text-slate-500"
        }`}
      >
        {isRunning ? (
          <>
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-blue-400"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
            <span>{activeAgent ?? "thinking"}</span>
          </>
        ) : (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
            <span>idle</span>
          </>
        )}
      </div>

      {eventCount > 0 && <span className="text-slate-600">{eventCount} events</span>}
      {sourceCount > 0 && <span className="text-slate-600">{sourceCount} sources</span>}
    </div>
  )
}
