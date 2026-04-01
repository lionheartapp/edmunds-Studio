"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import CompetitorAnalysis from "@/components/CompetitorAnalysis"
import { BrandDNA } from "@/lib/types"

export default function CompetitorsPage() {
  const router = useRouter()
  const [brandDna, setBrandDna] = useState<BrandDNA | null>(null)
  const [isLoadingCompetitors, setIsLoadingCompetitors] = useState(false)
  const [isLoadingEdge, setIsLoadingEdge] = useState(false)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("eds_brand_dna")
      if (!stored) {
        router.push("/")
        return
      }

      const parsed = JSON.parse(stored) as BrandDNA

      // If we already have competitor profiles in session, use them
      if (parsed.competitorProfiles && parsed.competitorProfiles.length > 0) {
        parsed.competitorProfiles = parsed.competitorProfiles.map(cp => ({
          ...cp,
          ads: cp.ads || [],
          strengths: cp.strengths || [],
          weaknesses: cp.weaknesses || [],
          audienceOverlap: cp.audienceOverlap || 0,
          adSpend: cp.adSpend || "Unknown",
          topPlatform: cp.topPlatform || "Unknown",
        }))
        setBrandDna(parsed)
        return
      }

      // No competitor profiles yet — check if the onboard page is already fetching
      setBrandDna(parsed)
      setIsLoadingCompetitors(true)

      const competitors = parsed.competitors || []
      if (competitors.length === 0) {
        setIsLoadingCompetitors(false)
        return
      }

      const prefetchInFlight = sessionStorage.getItem("eds_competitors_fetching") === "true"

      if (prefetchInFlight) {
        // Onboard page started a fetch — poll sessionStorage until it lands
        console.log("[competitors] Prefetch in-flight, polling for results...")
        const pollInterval = setInterval(() => {
          const fresh = sessionStorage.getItem("eds_brand_dna")
          if (!fresh) return
          const freshParsed = JSON.parse(fresh) as BrandDNA
          if (freshParsed.competitorProfiles && freshParsed.competitorProfiles.length > 0) {
            clearInterval(pollInterval)
            setBrandDna(freshParsed)
            setIsLoadingCompetitors(false)
            console.log("[competitors] Prefetched data arrived")
          }
          // If the flag is gone but no profiles, the prefetch failed — fetch ourselves
          if (sessionStorage.getItem("eds_competitors_fetching") !== "true" &&
              (!freshParsed.competitorProfiles || freshParsed.competitorProfiles.length === 0)) {
            clearInterval(pollInterval)
            fetchCompetitors(parsed)
          }
        }, 500)
        // Safety: stop polling after 50s and fetch ourselves
        setTimeout(() => {
          clearInterval(pollInterval)
          if (isLoadingCompetitors) fetchCompetitors(parsed)
        }, 50000)
      } else {
        // No prefetch running — fetch directly
        fetchCompetitors(parsed)
      }

      function fetchCompetitors(brand: BrandDNA) {
        fetch("/api/competitors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brandName: brand.name,
            competitors: (brand.competitors || []).slice(0, 3),
          }),
        })
          .then(res => res.json())
          .then(data => {
            const profiles = (data.competitorProfiles || []).map((cp: Record<string, unknown>) => ({
              ...cp,
              ads: (cp.ads as unknown[]) || [],
              strengths: (cp.strengths as string[]) || [],
              weaknesses: (cp.weaknesses as string[]) || [],
              audienceOverlap: (cp.audienceOverlap as number) || 0,
              adSpend: (cp.adSpend as string) || "Unknown",
              topPlatform: (cp.topPlatform as string) || "Unknown",
            }))

            const updated = { ...brand, competitorProfiles: profiles }
            setBrandDna(updated)
            sessionStorage.setItem("eds_brand_dna", JSON.stringify(updated))
          })
          .catch(err => {
            console.error("Failed to fetch competitor profiles:", err)
          })
          .finally(() => setIsLoadingCompetitors(false))
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
      router.push("/strategy")
    } finally {
      setIsLoadingEdge(false)
    }
  }

  if (!brandDna) return null

  return (
    <div className="min-h-screen">
      <CompetitorAnalysis
        brandDna={brandDna}
        onContinue={handleContinue}
        isLoadingCompetitors={isLoadingCompetitors}
      />
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
