"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import CompetitorAnalysis from "@/components/CompetitorAnalysis"
import { BrandDNA } from "@/lib/types"

export default function CompetitorsPage() {
  const router = useRouter()
  const [brandDna, setBrandDna] = useState<BrandDNA | null>(null)
  const [isLoadingEdge, setIsLoadingEdge] = useState(false)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("eds_brand_dna")
      if (stored) {
        const parsed = JSON.parse(stored) as BrandDNA
        // Ensure competitorProfiles is always an array with safe defaults
        if (parsed.competitorProfiles) {
          parsed.competitorProfiles = parsed.competitorProfiles.map(cp => ({
            ...cp,
            ads: cp.ads || [],
            strengths: cp.strengths || [],
            weaknesses: cp.weaknesses || [],
            audienceOverlap: cp.audienceOverlap || 0,
            adSpend: cp.adSpend || "Unknown",
            topPlatform: cp.topPlatform || "Unknown",
          }))
        } else {
          parsed.competitorProfiles = []
        }
        setBrandDna(parsed)
      } else {
        router.push("/")
      }
    } catch (e) {
      console.error("Failed to parse brand DNA:", e)
      router.push("/")
    }
  }, [router])

  const handleContinue = async () => {
    if (!brandDna) return
    setIsLoadingEdge(true)

    try {
      // Call the strategic edge API while transitioning
      const response = await fetch("/api/strategic-edge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandDna }),
      })

      if (!response.ok) throw new Error("Failed to generate strategic analysis")

      const { edge } = await response.json()
      sessionStorage.setItem("eds_strategic_edge", JSON.stringify(edge))
      router.push("/strategy")
    } catch (error) {
      console.error("Strategic edge analysis failed:", error)
      // Even if it fails, we can go to strategy with a fallback
      router.push("/strategy")
    } finally {
      setIsLoadingEdge(false)
    }
  }

  if (!brandDna) return null

  return (
    <div className="min-h-screen">
      <CompetitorAnalysis brandDna={brandDna} onContinue={handleContinue} />
      {isLoadingEdge && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-zinc-300 text-sm">Analyzing your strategic opportunities...</p>
          </div>
        </div>
      )}
    </div>
  )
}
