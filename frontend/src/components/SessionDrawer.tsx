"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { useResearchStore } from "@/store/useResearchStore"
import { fetchSessions, deleteSession } from "@/lib/api"
import type { SessionSummary } from "@/types/events"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

const STATUS_STYLE: Record<string, string> = {
  done: "text-teal-500",
  running: "text-blue-400",
  error: "text-rose-400",
}

export default function SessionDrawer() {
  const [open, setOpen] = useState(false)
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const setQuery = useResearchStore((s) => s.setQuery)
  const reset = useResearchStore((s) => s.reset)

  useEffect(() => {
    if (open) fetchSessions().then(setSessions)
  }, [open])

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    await deleteSession(id)
    setSessions((prev) => prev.filter((s) => s.session_id !== id))
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/50 px-2.5 py-1 font-mono text-[10px] text-slate-400 transition-colors hover:border-blue-700/50 hover:text-blue-400">
          <span>◫</span>
          <span>Sessions</span>
          {sessions.length > 0 && (
            <span className="rounded bg-slate-700 px-1 text-[9px] text-slate-400">
              {sessions.length}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="flex w-80 flex-col border-r border-blue-900/20 bg-[#0b1120] p-0"
      >
        <SheetHeader className="border-b border-slate-700/60 px-5 py-4">
          <SheetTitle className="font-mono text-sm text-slate-300">Session History</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="divide-y divide-slate-800/40">
            {sessions.length === 0 && (
              <p className="p-6 text-center font-mono text-xs text-slate-600">No past sessions</p>
            )}
            <AnimatePresence>
              {sessions.map((s, i) => (
                <motion.div
                  key={s.session_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => {
                    reset()
                    setQuery(s.query)
                    setOpen(false)
                  }}
                  className="group flex cursor-pointer items-start justify-between px-5 py-3.5 transition-colors hover:bg-slate-800/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs text-slate-300">{s.query}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-slate-600">
                      {format(new Date(s.created_at), "MMM d, HH:mm")}
                      {" · "}
                      <span className={STATUS_STYLE[s.status] ?? "text-slate-600"}>{s.status}</span>
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(s.session_id, e)}
                    className="ml-3 shrink-0 rounded p-1 font-mono text-[10px] text-slate-600 opacity-0 transition-opacity hover:bg-rose-950/40 hover:text-rose-500 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
