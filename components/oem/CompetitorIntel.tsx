"use client"

import { useState, useEffect, useCallback } from "react"
import type { CompetitorIntelData, CompetitorCtaEntry } from "@/lib/oem-types"

interface CompetitorIntelProps {
  brandName: string
  onLoaded: (data: CompetitorIntelData) => void
}

export default function CompetitorIntel({ brandName, onLoaded }: CompetitorIntelProps) {
  const [data, setData] = useState<CompetitorIntelData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchIntel = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName }),
      })

      if (!response.ok) throw new Error("Failed to fetch competitor data")

      const result = await response.json()

      // Extract CTA data from competitor profiles
      const competitors: CompetitorCtaEntry[] = (result.competitors ?? [])
        .slice(0, 3)
        .flatMap((comp: { name: string; ads?: Array<{ cta: string; format: string }> }) =>
          (comp.ads ?? []).slice(0, 2).map((ad: { cta: string; format: string }) => ({
            brand: comp.name,
            cta: ad.cta,
            score: 0, // Will be scored client-side or by API
            format: ad.format,
          }))
        )

      // Identify category gaps from competitor CTAs
      const gaps = identifyGaps(competitors.map((c) => c.cta))

      const intel: CompetitorIntelData = { competitors, gaps }
      setData(intel)
      onLoaded(intel)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load competitor data")
    } finally {
      setLoading(false)
    }
  }, [brandName, onLoaded])

  useEffect(() => {
    fetchIntel()
  }, [fetchIntel])

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-eds-50 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-400">Analyzing competitor ads...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <p className="text-sm text-red-400">{error}</p>
        <button onClick={fetchIntel} className="text-xs text-eds-50 mt-2 hover:underline">
          Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-bold tracking-tight mb-4">Competitor Intelligence</h3>

        {/* Competitor CTAs */}
        {data.competitors.length > 0 ? (
          <div className="space-y-3 mb-6">
            {data.competitors.map((entry, i) => (
              <CompetitorRow key={i} entry={entry} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 mb-6">No competitor ad data available for {brandName}.</p>
        )}

        {/* Category Gaps */}
        {data.gaps.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-3">Category Gaps</h4>
            <div className="space-y-2">
              {data.gaps.map((gap, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15"
                >
                  <span className="text-emerald-400 text-sm mt-0.5">◆</span>
                  <p className="text-xs text-emerald-300">{gap}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CompetitorRow({ entry }: { entry: CompetitorCtaEntry }) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
      {/* Brand */}
      <div className="flex-shrink-0 w-24">
        <p className="text-xs font-semibold text-zinc-300 truncate">{entry.brand}</p>
        <p className="text-[10px] text-zinc-600">{entry.format}</p>
      </div>

      {/* CTA */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium">&ldquo;{entry.cta}&rdquo;</p>
      </div>

      {/* Score (if available) */}
      {entry.score > 0 && (
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{
            backgroundColor: `${getScoreColor(entry.score)}15`,
            color: getScoreColor(entry.score),
          }}
        >
          {entry.score}
        </div>
      )}
    </div>
  )
}

function getScoreColor(score: number): string {
  if (score >= 75) return "#22c55e"
  if (score >= 50) return "#eab308"
  if (score >= 30) return "#f97316"
  return "#ef4444"
}

function identifyGaps(competitorCTAs: string[]): string[] {
  if (competitorCTAs.length === 0) return []

  const categories = new Set<string>()
  for (const cta of competitorCTAs) {
    const lower = cta.toLowerCase()
    if (/build|configure|customize/.test(lower)) categories.add("configurator")
    if (/\$|%|credit|qualify|incentive/.test(lower)) categories.add("incentive")
    if (/now|today|hurry|limited/.test(lower)) categories.add("urgency")
    if (/save|value|payment|deal/.test(lower)) categories.add("value")
    if (/experience|dream|exclusive/.test(lower)) categories.add("emotional")
    if (/learn|explore|browse|view/.test(lower)) categories.add("informational")
  }

  const gaps: string[] = []
  if (!categories.has("configurator")) gaps.push("No competitor is using configurator CTAs — high-engagement opportunity")
  if (!categories.has("incentive")) gaps.push("No competitor is promoting specific incentives — value gap to exploit")
  if (!categories.has("urgency")) gaps.push("No urgency-based CTAs in competitive set — scarcity messaging opportunity")

  return gaps
}
