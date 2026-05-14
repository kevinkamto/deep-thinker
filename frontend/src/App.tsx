import { useResearchStore } from "@/store/useResearchStore"
import CommandBar from "@/components/CommandBar"
import AgentPipeline from "@/components/AgentPipeline"
import LogStream from "@/components/LogStream"
import SourcesPanel from "@/components/SourcesPanel"
import ReportViewer from "@/components/ReportViewer"
import SessionDrawer from "@/components/SessionDrawer"
import StatusBar from "@/components/StatusBar"
import { motion, AnimatePresence } from "framer-motion"

export default function App() {
  const hasReport = useResearchStore((s) => s.reportChunks.length > 0)
  const isRunning = useResearchStore((s) => s.isRunning)
  const query = useResearchStore((s) => s.query)

  return (
    <div
      className="grid-bg relative flex h-screen justify-center overflow-hidden"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <div className="relative z-10 flex h-full w-full max-w-360 flex-col border-x border-amber-900/15">

        {/* Header */}
        <header className="flex shrink-0 items-center gap-4 border-b border-stone-700/60 bg-stone-900/60 px-6 py-3 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-800/20 ring-1 ring-amber-700/40">
              <span className="font-mono text-xs font-bold text-amber-600">DT</span>
            </div>
            <div>
              <span className="font-mono text-xs font-semibold tracking-widest text-stone-200">
                DEEP THINKER
              </span>
              <span className="ml-2 font-mono text-[9px] tracking-wider text-stone-500">
                AI RESEARCH AGENT
              </span>
            </div>
          </div>
          <div className="flex-1" />
          <StatusBar />
          <div className="h-4 w-px bg-stone-700" />
          <SessionDrawer />
        </header>

        {/* Command Bar */}
        <div className="shrink-0 border-b border-stone-700/40 bg-stone-950/40 px-6 py-4">
          <CommandBar />
        </div>

        {/* Main 2-column layout */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="flex min-w-0 flex-55 flex-col border-r border-stone-700/40 overflow-hidden">
            <div className="flex shrink-0 items-center gap-2 border-b border-stone-700/30 px-5 py-2">
              <span className="text-[10px] text-amber-700">◈</span>
              <p className="font-mono text-[10px] tracking-widest text-stone-500 uppercase">
                Thinking Stream
              </p>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <LogStream />
            </div>
          </div>

          <div className="flex min-w-0 flex-45 flex-col overflow-hidden">
            <div className="flex shrink-0 items-center gap-2 border-b border-stone-700/30 px-5 py-2">
              <span className="text-[10px] text-lime-700">◎</span>
              <p className="font-mono text-[10px] tracking-widest text-stone-500 uppercase">
                Research Sources
              </p>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <SourcesPanel />
            </div>
          </div>
        </div>

        {/* Agent Pipeline */}
        <div className="shrink-0 border-t border-stone-700/40 bg-stone-900/40">
          <AgentPipeline />
        </div>

        {/* Inline Report */}
        <AnimatePresence>
          {hasReport && (
            <motion.div
              key="report"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="shrink-0 overflow-hidden border-t border-amber-900/25 bg-stone-900/50"
            >
              <div className="flex items-center justify-between border-b border-stone-700/40 px-6 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-amber-600">◆</span>
                  <p className="font-mono text-[10px] tracking-widest text-stone-400 uppercase">
                    Deep Analysis
                  </p>
                </div>
                {query && (
                  <p className="max-w-xs truncate font-mono text-[10px] text-stone-500 italic">
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
