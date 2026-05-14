"use client"

import { useState, useEffect, useRef } from "react"
import { useResearchStore } from "@/store/useResearchStore"
import { submitResearch, openWebSocket } from "@/lib/api"
import type { WSEvent } from "@/types/events"
import { motion, AnimatePresence } from "framer-motion"

const PLACEHOLDERS = [
  "What are the long-term effects of artificial general intelligence on labor markets?",
  "How is quantum computing reshaping modern cryptography?",
  "What drives the economic divergence between renewable and fossil fuel energy?",
  "How do large language models develop emergent reasoning capabilities?",
  "What are the geopolitical implications of rare earth mineral scarcity?",
]

export default function CommandBar() {
  const { query, setQuery, startSession, addEvent, isRunning } = useResearchStore()
  const [phIdx, setPhIdx] = useState(0)
  const [displayPh, setDisplayPh] = useState(PLACEHOLDERS[0])
  const [fading, setFading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const id = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setPhIdx((i) => {
          const next = (i + 1) % PLACEHOLDERS.length
          setDisplayPh(PLACEHOLDERS[next])
          return next
        })
        setFading(false)
      }, 300)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim() || isRunning) return
    setError(null)
    wsRef.current?.close()

    try {
      const { session_id } = await submitResearch(query)
      startSession(session_id, query)
      const ws = openWebSocket(session_id, (data) => {
        addEvent(data as WSEvent)
      })
      wsRef.current = ws
    } catch {
      setError("Failed to connect. Is the backend running?")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`relative flex items-center rounded-xl border bg-black/50 backdrop-blur-sm transition-all duration-200 ${
          isRunning
            ? "border-amber-500/50 shadow-[0_0_20px_rgba(251,191,36,0.08)]"
            : "border-stone-800 focus-within:border-amber-500/40 focus-within:shadow-[0_0_20px_rgba(251,191,36,0.06)]"
        }`}
      >
        {/* Left icon */}
        <div className="flex shrink-0 items-center gap-2 pl-4">
          {isRunning ? (
            <motion.span
              className="font-mono text-sm text-amber-400"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              ◉
            </motion.span>
          ) : (
            <span className="font-mono text-sm text-stone-600">▷</span>
          )}
        </div>

        {/* Input */}
        <div className="relative flex-1 overflow-hidden">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isRunning}
            className="w-full bg-transparent px-3 py-3.5 font-mono text-sm text-stone-100 outline-none placeholder:text-stone-700 disabled:opacity-60"
            placeholder=""
          />
          {/* Animated placeholder */}
          {!query && (
            <AnimatePresence mode="wait">
              <motion.span
                key={phIdx}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: fading ? 0 : 0.4, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="pointer-events-none absolute inset-0 flex items-center px-3 font-mono text-sm text-stone-600"
              >
                {displayPh}
              </motion.span>
            </AnimatePresence>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isRunning || !query.trim()}
          className={`mr-2 shrink-0 rounded-lg px-4 py-2 font-mono text-xs font-semibold tracking-wider transition-all duration-200 ${
            isRunning
              ? "cursor-not-allowed bg-amber-900/30 text-amber-600"
              : query.trim()
                ? "bg-amber-500 text-black hover:bg-amber-400 active:scale-95"
                : "cursor-not-allowed bg-stone-800 text-stone-600"
          }`}
        >
          {isRunning ? (
            <span className="flex items-center gap-1.5">
              <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                ◌
              </motion.span>
              THINKING
            </span>
          ) : (
            "THINK DEEP ▶"
          )}
        </button>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 font-mono text-xs text-rose-400"
        >
          ✗ {error}
        </motion.p>
      )}
    </form>
  )
}
