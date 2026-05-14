"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useResearchStore } from "@/store/useResearchStore"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "")
  } catch {
    return url
  }
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-20 overflow-hidden rounded-full bg-stone-800">
        <motion.div
          className="h-full rounded-full bg-amber-700"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <span className="font-mono text-[9px] text-stone-600">{pct}%</span>
    </div>
  )
}

export default function SourcesPanel() {
  const { sources, subtopics } = useResearchStore()
  const tabs = subtopics.length > 0 ? subtopics : Object.keys(sources)
  const [activeTab, setActiveTab] = useState<string>("")

  useEffect(() => {
    if (tabs.length > 0 && !tabs.includes(activeTab)) {
      setActiveTab(tabs[0])
    }
  }, [tabs, activeTab])

  if (tabs.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-700 text-stone-600">
          ◎
        </div>
        <p className="font-mono text-xs text-stone-600">Sources will appear as threads complete...</p>
      </div>
    )
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col gap-2">
      <TabsList className="flex h-auto flex-wrap gap-1 bg-transparent p-0">
        {tabs.map((t) => (
          <TabsTrigger
            key={t}
            value={t}
            className="h-6 rounded-md border border-stone-700 bg-stone-800/50 px-2 font-mono text-[10px] text-stone-500 data-[state=active]:border-amber-700/50 data-[state=active]:bg-amber-950/40 data-[state=active]:text-amber-600"
          >
            {t.slice(0, 18)}
            {t.length > 18 && "…"}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((t) => {
        const activeSources = sources[t] ?? []
        return (
          <TabsContent key={t} value={t} className="mt-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-2 pr-1">
                <AnimatePresence>
                  {activeSources.length === 0 && (
                    <p className="pt-6 text-center font-mono text-xs text-stone-600">
                      Gathering sources...
                    </p>
                  )}
                  {activeSources.map((src, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                      className="group rounded-lg border border-stone-700/70 bg-stone-800/30 p-3 transition-colors hover:border-amber-800/50 hover:bg-stone-800/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-2 flex-1 font-mono text-[11px] leading-relaxed text-stone-300">
                          {src.title}
                        </p>
                        <span className="shrink-0 rounded bg-stone-700 px-1.5 py-0.5 font-mono text-[9px] text-stone-400">
                          {getDomain(src.url)}
                        </span>
                      </div>

                      {src.snippet && (
                        <p className="mt-1.5 line-clamp-2 font-mono text-[10px] leading-relaxed text-stone-500">
                          {src.snippet}
                        </p>
                      )}

                      <div className="mt-2 flex items-center justify-between">
                        <ScoreBar score={src.score} />
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[10px] text-amber-700 opacity-0 transition-opacity hover:text-amber-500 group-hover:opacity-100"
                        >
                          open ↗
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </TabsContent>
        )
      })}
    </Tabs>
  )
}
