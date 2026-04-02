"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import CompetitorAnalysis from "@/components/CompetitorAnalysis"
import StepIndicator from "@/components/StepIndicator"
import ErrorState from "@/components/ErrorState"
import FullPageLoader from "@/components/FullPageLoader"
import { BrandDNA } from "@/lib/types"

const COMPETITOR_MESSAGES = [
  "Sizing up the competition...",
  "Reading their ad copy so you don't have to...",
  "Calculating audience overlap with scary precision...",
  "Finding where they're spending and where they're not...",
  "Reverse-engineering their ad strategy...",
  "Judging their creative choices (objectively, of course)...",
]

export default function CompetitorsPage() {
  const router = useRouter()
  const [brandDna, setBrandDna] = useState<BrandDNA | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const fetchStarted = useRef(false)

  const fetchCompetitors = useCallback(async (brand: BrandDNA) => {
    const competitors = brand.competitors || []
    console.log("[competitors] brand.competitors:", competitors)
    if (competitors.length === 0) {
      console.warn("[competitors] No competitor names in brand DNA — skipping fetch")
      setIsLoading(false)
      return
    }

    try {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 30000)

      const res = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: brand.name,
          competitors: competitors.slice(0, 3),
        }),
        signal: ctrl.signal,
      })
      clearTimeout(timer)

      if (!res.ok) {
        throw new Error(`Competitors API returned ${res.status}`)
      }

      const data = await res.json()
      const profiles = (data.competitorProfiles || []).map(
        (cp: Record<string, unknown>) => ({
          ...cp,
          ads: (cp.ads as unknown[]) || [],
          strengths: (cp.strengths as string[]) || [],
          weaknesses: (cp.weaknesses as string[]) || [],
          audienceOverlap: (cp.audienceOverlap as number) || 0,
          adSpend: (cp.adSpend as string) || "Unknown",
          topPlatform: (cp.topPlatform as string) || "Unknown",
        })
      )

      // Only cache if we actually got data
      if (profiles.length > 0) {
        const updated = { ...brand, competitorProfiles: profiles }
        setBrandDna(updated)
        sessionStorage.setItem("eds_brand_dna", JSON.stringify(updated))
      } else {
        setFetchError("No competitor data returned. Try again.")
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Failed to fetch competitor profiles:", err)
        setFetchError("Failed to load competitor data.")
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const stored = sessionStorage.getItem("eds_brand_dna")
    if (!stored) {
      router.push("/")
      return
    }

    const parsed = JSON.parse(stored) as BrandDNA

    // If we already have competitor profiles cached, skip fetch
    if (parsed.competitorProfiles && parsed.competitorProfiles.length > 0) {
      setBrandDna(parsed)
      setIsLoading(false)
      return
    }

    setBrandDna(parsed)

    if (fetchStarted.current) return
    fetchStarted.current = true
    fetchCompetitors(parsed)
  }, [router, fetchCompetitors])

  const handleRetry = useCallback(() => {
    if (!brandDna) return
    setFetchError(null)
    setIsLoading(true)
    fetchStarted.current = false
    fetchCompetitors(brandDna)
  }, [brandDna, fetchCompetitors])

  const handleContinue = () => {
    router.push("/strategy")
  }

  if (!brandDna) return null

  if (isLoading) {
    return (
      <FullPageLoader
        title="Analyzing the competition..."
        messages={COMPETITOR_MESSAGES}
      />
    )
  }

  return (
    <div className="min-h-screen">
      <StepIndicator />
      {fetchError && (
        <div className="max-w-2xl mx-auto px-4 mb-4">
          <ErrorState message={fetchError} onRetry={handleRetry} />
        </div>
      )}
      <CompetitorAnalysis brandDna={brandDna} onContinue={handleContinue} />
    </div>
  )
}
