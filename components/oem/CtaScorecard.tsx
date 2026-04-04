"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { CtaSuggestion, CtaScoreResponse } from "@/lib/oem-types"

interface CtaScorecardProps {
  cta: string
  brandName: string
  vehicleSegment?: string
  onApplyCta: (cta: string) => void
  onLoaded: (suggestions: CtaSuggestion[]) => void
}

export default function CtaScorecard({
  cta,
  brandName,
  vehicleSegment,
  onApplyCta,
  onLoaded,
}: CtaScorecardProps) {
  const [result, setResult] = useState<CtaScoreResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasFetched = useRef(false)
  const onLoadedRef = useRef(onLoaded)
  onLoadedRef.current = onLoaded

  const fetchScore = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/oem/cta-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cta, brandName, vehicleSegment }),
      })

      if (!response.ok) throw new Error("Failed to score CTA")

      const data: CtaScoreResponse = await response.json()
      setResult(data)
      onLoadedRef.current(data.suggestions)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scoring failed")
    } finally {
      setLoading(false)
    }
  }, [cta, brandName, vehicleSegment])

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    fetchScore()
  }, [fetchScore])

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-eds-50 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-400">Scoring your CTA...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <p className="text-sm text-red-400">{error}</p>
        <button onClick={fetchScore} className="text-xs text-eds-50 mt-2 hover:underline">
          Retry
        </button>
      </div>
    )
  }

  if (!result) return null

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800">
        <h3 className="text-lg font-bold tracking-tight mb-4">CTA Scorecard</h3>

        <div className="flex items-start gap-6">
          {/* Score Gauge */}
          <div className="flex-shrink-0 relative w-24 h-24">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(63,63,70,0.5)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="40"
                fill="none"
                stroke={getScoreColor(result.score)}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(result.score / 100) * 251.2} 251.2`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold" style={{ color: getScoreColor(result.score) }}>
                {result.score}
              </span>
            </div>
          </div>

          {/* Current CTA + Analysis */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Current CTA</p>
            <p className="text-lg font-semibold text-white mb-3">&ldquo;{cta}&rdquo;</p>

            {result.strengths.length > 0 && (
              <div className="mb-2">
                {result.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-emerald-400 mb-1">
                    <span className="mt-0.5">+</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            )}

            {result.weaknesses.length > 0 && (
              <div>
                {result.weaknesses.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-amber-400 mb-1">
                    <span className="mt-0.5">−</span>
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {result.suggestions.length > 0 && (
        <div className="p-6">
          <h4 className="text-sm font-semibold text-zinc-300 mb-4">Alternative CTAs</h4>
          <div className="space-y-3">
            {result.suggestions.map((suggestion, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 transition-colors group"
              >
                {/* Score */}
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor: `${getScoreColor(suggestion.score)}15`,
                    color: getScoreColor(suggestion.score),
                  }}
                >
                  {suggestion.score}
                </div>

                {/* CTA + Reason */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">&ldquo;{suggestion.cta}&rdquo;</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{suggestion.reason}</p>
                </div>

                {/* Category Badge */}
                <span className="flex-shrink-0 text-[10px] uppercase tracking-wider text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                  {suggestion.category}
                </span>

                {/* Apply Button */}
                <button
                  onClick={() => onApplyCta(suggestion.cta)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium text-eds-50 border border-eds-50/30 hover:bg-eds-50/10 opacity-0 group-hover:opacity-100 transition-all"
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitor Benchmark */}
      {result.competitorBenchmark && (
        <div className="px-6 pb-6">
          <div className="rounded-xl bg-zinc-800/30 border border-zinc-700/30 p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Competitor Benchmark</p>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-zinc-500">Avg Score:</span>{" "}
                <span className="font-semibold" style={{ color: getScoreColor(result.competitorBenchmark.averageScore) }}>
                  {result.competitorBenchmark.averageScore}
                </span>
              </div>
              <div>
                <span className="text-zinc-500">Best:</span>{" "}
                <span className="text-white font-medium">&ldquo;{result.competitorBenchmark.bestCta}&rdquo;</span>{" "}
                <span className="font-semibold" style={{ color: getScoreColor(result.competitorBenchmark.bestScore) }}>
                  ({result.competitorBenchmark.bestScore})
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getScoreColor(score: number): string {
  if (score >= 75) return "#22c55e" // green
  if (score >= 50) return "#eab308" // yellow
  if (score >= 30) return "#f97316" // orange
  return "#ef4444" // red
}
