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
      {/* Status pill */}
      <div
        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${
          isRunning
            ? "bg-amber-950/60 text-amber-400 ring-1 ring-amber-500/30"
            : "bg-stone-900 text-stone-600"
        }`}
      >
        {isRunning ? (
          <>
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-amber-400"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
            <span>{activeAgent ?? "thinking"}</span>
          </>
        ) : (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-stone-700" />
            <span>idle</span>
          </>
        )}
      </div>

      {/* Stats */}
      {eventCount > 0 && (
        <span className="text-stone-700">{eventCount} events</span>
      )}
      {sourceCount > 0 && (
        <span className="text-stone-700">{sourceCount} sources</span>
      )}
    </div>
  )
}
