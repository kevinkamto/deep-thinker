"use client"

import { useResearchStore } from "@/store/useResearchStore"
import CommandBar from "@/components/CommandBar"
import AgentPipeline from "@/components/AgentPipeline"
import LogStream from "@/components/LogStream"
import SourcesPanel from "@/components/SourcesPanel"
import ReportViewer from "@/components/ReportViewer"
import SessionDrawer from "@/components/SessionDrawer"
import StatusBar from "@/components/StatusBar"
import { motion, AnimatePresence } from "framer-motion"

export default function Page() {
  const hasReport = useResearchStore((s) => s.reportChunks.length > 0)
  const isRunning = useResearchStore((s) => s.isRunning)
  const query = useResearchStore((s) => s.query)

  return (
    <div
      className="grid-bg relative flex h-screen justify-center overflow-hidden"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <div className="relative z-10 flex h-full w-full max-w-360 flex-col border-x border-blue-900/20">

        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="flex shrink-0 items-center gap-4 border-b border-slate-700/60 bg-slate-900/60 px-6 py-3 backdrop-blur-md">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 ring-1 ring-blue-500/40">
              <span className="font-mono text-xs font-bold text-blue-400">DT</span>
            </div>
            <div>
              <span className="font-mono text-xs font-semibold tracking-widest text-slate-200">
                DEEP THINKER
              </span>
              <span className="ml-2 font-mono text-[9px] tracking-wider text-slate-500">
                AI RESEARCH AGENT
              </span>
            </div>
          </div>

          <div className="flex-1" />

          {/* Status + Sessions */}
          <StatusBar />
          <div className="h-4 w-px bg-slate-700" />
          <SessionDrawer />
        </header>

        {/* ── Command Bar ────────────────────────────────────────── */}
        <div className="shrink-0 border-b border-slate-700/40 bg-slate-950/40 px-6 py-4">
          <CommandBar />
        </div>

        {/* ── Main 2-column layout ───────────────────────────────── */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Left: Thinking Stream (55%) */}
          <div className="flex min-w-0 flex-55 flex-col border-r border-slate-700/40 overflow-hidden">
            <div className="flex shrink-0 items-center gap-2 border-b border-slate-700/30 px-5 py-2">
              <span className="text-[10px] text-blue-500">◈</span>
              <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">
                Thinking Stream
              </p>
              {isRunning && (
                <motion.span
                  className="ml-auto font-mono text-[9px] text-blue-400"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.4 }}
                >
                  live
                </motion.span>
              )}
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <LogStream />
            </div>
          </div>

          {/* Right: Research Sources (45%) */}
          <div className="flex min-w-0 flex-45 flex-col overflow-hidden">
            <div className="flex shrink-0 items-center gap-2 border-b border-slate-700/30 px-5 py-2">
              <span className="text-[10px] text-teal-500">◎</span>
              <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">
                Research Sources
              </p>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <SourcesPanel />
            </div>
          </div>
        </div>

        {/* ── Agent Pipeline ─────────────────────────────────────── */}
        <div className="shrink-0 border-t border-slate-700/40 bg-slate-900/40">
          <div className="flex items-center gap-3 border-b border-slate-700/20 px-6 py-1.5">
            <span className="font-mono text-[9px] tracking-widest text-slate-600 uppercase">
              Agent Pipeline
            </span>
          </div>
          <AgentPipeline />
        </div>

        {/* ── Inline Report ──────────────────────────────────────── */}
        <AnimatePresence>
          {hasReport && (
            <motion.div
              key="report"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="shrink-0 overflow-hidden border-t border-blue-800/30 bg-slate-900/50"
            >
              <div className="flex items-center justify-between border-b border-slate-700/40 px-6 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-blue-400">◆</span>
                  <p className="font-mono text-[10px] tracking-widest text-slate-400 uppercase">
                    Deep Analysis
                  </p>
                  {!isRunning && (
                    <span className="rounded bg-blue-900/40 px-1.5 py-0.5 font-mono text-[9px] text-blue-400">
                      complete
                    </span>
                  )}
                </div>
                {query && (
                  <p className="max-w-xs truncate font-mono text-[10px] text-slate-500 italic">
                    "{query}"
                  </p>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto px-6 py-5">
                <ReportViewer />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
