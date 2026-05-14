"use client"

import { useResearchStore } from "@/store/useResearchStore"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { motion } from "framer-motion"
import { buttonVariants } from "@/components/ui/button"

export default function ReportViewer() {
  const { reportChunks, events } = useResearchStore()
  const report = reportChunks.join("")
  const isDone = events.some((e) => e.event === "REPORT_DONE")

  if (!report) {
    return (
      <div className="flex h-24 items-center justify-center">
        <p className="font-mono text-xs text-stone-700">Report will appear here when ready...</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Action bar */}
      {isDone && (
        <div className="mb-5 flex items-center gap-3 border-b border-stone-800 pb-4">
          <button
            onClick={() => navigator.clipboard.writeText(report)}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Copy markdown
          </button>
          <a
            href={`data:text/markdown;charset=utf-8,${encodeURIComponent(report)}`}
            download="deep-thinker-report.md"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Export .md
          </a>
          <span className="ml-auto font-mono text-[10px] text-stone-600">
            {report.trim().split(/\s+/).length.toLocaleString()} words
          </span>
        </div>
      )}

      {/* Markdown content */}
      <div className="prose prose-invert prose-sm max-w-none font-serif">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
      </div>

      {/* Streaming cursor */}
      {!isDone && (
        <span className="ml-0.5 inline-block h-4 w-[3px] rounded-sm bg-amber-400 cursor-blink" />
      )}
    </motion.div>
  )
}
