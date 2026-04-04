"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { OemCopy, OptimizationSet, Optimization } from "@/lib/oem-types"

interface OptimizationPanelProps {
  copy: OemCopy
  brandName: string
  vehicleSegment?: string
  onLoaded: (optimizations: OptimizationSet) => void
}

type Tab = "demographic" | "regional" | "seasonal"

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "demographic", label: "Demographic", icon: "👥" },
  { key: "regional", label: "Regional", icon: "📍" },
  { key: "seasonal", label: "Seasonal", icon: "📅" },
]

export default function OptimizationPanel({
  copy,
  brandName,
  vehicleSegment,
  onLoaded,
}: OptimizationPanelProps) {
  const [data, setData] = useState<OptimizationSet | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>("demographic")
  const hasFetched = useRef(false)
  const onLoadedRef = useRef(onLoaded)
  onLoadedRef.current = onLoaded

  const fetchOptimizations = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/oem/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName, copy, vehicleSegment }),
      })

      if (!response.ok) throw new Error("Failed to fetch optimizations")

      const result: OptimizationSet = await response.json()
      setData(result)
      onLoadedRef.current(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Optimization failed")
    } finally {
      setLoading(false)
    }
  }, [brandName, copy, vehicleSegment])

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    fetchOptimizations()
  }, [fetchOptimizations])

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-eds-50 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-400">Analyzing market data for optimizations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <p className="text-sm text-red-400">{error}</p>
        <button onClick={fetchOptimizations} className="text-xs text-eds-50 mt-2 hover:underline">
          Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  const activeData = data[activeTab]

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <div className="p-6 pb-0">
        <h3 className="text-lg font-bold tracking-tight mb-4">Optimization Suggestions</h3>

        {/* Tab bar */}
        <div className="flex gap-1 border-b border-zinc-800">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab.key
                  ? "text-eds-60"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-eds-50 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {activeData.length === 0 ? (
          <p className="text-sm text-zinc-500">No {activeTab} optimizations available for this brand.</p>
        ) : (
          activeData.map((opt, i) => (
            <OptimizationCard key={i} optimization={opt} />
          ))
        )}
      </div>
    </div>
  )
}

function OptimizationCard({ optimization }: { optimization: Optimization }) {
  const confidenceColors = {
    high: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
    medium: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
    low: { bg: "bg-zinc-500/10", text: "text-zinc-400", border: "border-zinc-500/20" },
  }

  const colors = confidenceColors[optimization.confidence]

  return (
    <div className={`p-4 rounded-xl border ${colors.border} ${colors.bg}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white">{optimization.title}</h4>
          <p className="text-xs text-zinc-400 mt-1">{optimization.description}</p>
          {optimization.dataPoint && (
            <p className="text-xs text-zinc-500 mt-2 italic">{optimization.dataPoint}</p>
          )}
        </div>
        <span className={`flex-shrink-0 text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded ${colors.text} ${colors.bg}`}>
          {optimization.confidence}
        </span>
      </div>
    </div>
  )
}
