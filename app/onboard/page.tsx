"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import BrandDNACard from "@/components/BrandDNACard"
import StepIndicator from "@/components/StepIndicator"
import ErrorState from "@/components/ErrorState"
import { BrandDNA, EdmundsAdsData, SocialAdsData } from "@/lib/types"

export default function OnboardPage() {
  const router = useRouter()
  const [brandDna, setBrandDna] = useState<BrandDNA | null>(null)
  const [edmundsAds, setEdmundsAds] = useState<EdmundsAdsData | null>(null)
  const [socialAds, setSocialAds] = useState<SocialAdsData | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [edmundsMarket, setEdmundsMarket] = useState<any>(null)

  // Loading states for each section
  const [edmundsAdsLoading, setEdmundsAdsLoading] = useState(false)
  const [socialAdsLoading, setSocialAdsLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const fetchStarted = useRef(false)

  useEffect(() => {
    const stored = sessionStorage.getItem("eds_brand_dna")
    if (!stored) {
      router.push("/")
      return
    }

    const parsed = JSON.parse(stored) as BrandDNA
    setBrandDna(parsed)

    // Load cached Edmunds market data (set during brand analysis)
    const cachedMarket = sessionStorage.getItem("eds_edmunds_market")
    if (cachedMarket) {
      setEdmundsMarket(JSON.parse(cachedMarket))
    }

    // Check for cached data first — skip fetches if we have it
    const cachedEdmunds = sessionStorage.getItem("eds_edmunds_ads")
    const cachedSocial = sessionStorage.getItem("eds_social_ads")

    if (cachedEdmunds) setEdmundsAds(JSON.parse(cachedEdmunds))
    if (cachedSocial) setSocialAds(JSON.parse(cachedSocial))

    // If everything is cached, nothing to fetch
    if (cachedEdmunds && cachedSocial) return
    if (fetchStarted.current) return
    fetchStarted.current = true

    // ── Parallel fetch pipeline ──
    // Steps 1+2 run in parallel, step 3 (competitors) deferred after both resolve.
    runParallelFetches(parsed, !!cachedEdmunds, !!cachedSocial)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const retryFetches = useCallback(() => {
    if (!brandDna) return
    setFetchError(null)
    fetchStarted.current = false
    const cachedEdmunds = sessionStorage.getItem("eds_edmunds_ads")
    const cachedSocial = sessionStorage.getItem("eds_social_ads")
    if (cachedEdmunds && cachedSocial) return
    fetchStarted.current = true
    runParallelFetches(brandDna, !!cachedEdmunds, !!cachedSocial)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandDna])

  async function runParallelFetches(
    parsed: BrandDNA,
    hasEdmunds: boolean,
    hasSocial: boolean,
  ) {
    // ── Steps 1+2: Edmunds ads + Social ads in parallel ──
    const fetches: Promise<void>[] = []

    if (!hasEdmunds) {
      setEdmundsAdsLoading(true)
      fetches.push(
        (async () => {
          try {
            const ctrl = new AbortController()
            const timer = setTimeout(() => ctrl.abort(), 20000)
            const res = await fetch("/api/edmunds-ads", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ make: parsed.name }),
              signal: ctrl.signal,
            })
            clearTimeout(timer)
            const data = await res.json()
            if (data.edmundsAds) {
              sessionStorage.setItem("eds_edmunds_ads", JSON.stringify(data.edmundsAds))
              setEdmundsAds(data.edmundsAds)
            }
          } catch (err) {
            if (err instanceof Error && err.name !== "AbortError") {
              console.warn("[fetch] Edmunds ads failed:", err)
              setFetchError("Failed to load Edmunds ad data.")
            }
          } finally {
            setEdmundsAdsLoading(false)
          }
        })()
      )
    }

    if (!hasSocial) {
      setSocialAdsLoading(true)
      fetches.push(
        (async () => {
          try {
            const ctrl = new AbortController()
            const timer = setTimeout(() => ctrl.abort(), 15000)
            const res = await fetch("/api/social-ads", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ brandName: parsed.name, limit: 6 }),
              signal: ctrl.signal,
            })
            clearTimeout(timer)
            const data = await res.json()
            if (data.socialAds) {
              sessionStorage.setItem("eds_social_ads", JSON.stringify(data.socialAds))
              setSocialAds(data.socialAds)
            }
          } catch (err) {
            if (err instanceof Error && err.name !== "AbortError") {
              console.warn("[fetch] Social ads failed:", err)
              setFetchError("Failed to load social ad data.")
            }
          } finally {
            setSocialAdsLoading(false)
          }
        })()
      )
    }

    // Wait for both visible-data fetches to complete
    await Promise.allSettled(fetches)

    // ── Step 3: Competitors — deferred background prefetch ──
    if (
      parsed.competitors &&
      parsed.competitors.length > 0 &&
      (!parsed.competitorProfiles || parsed.competitorProfiles.length === 0)
    ) {
      sessionStorage.setItem("eds_competitors_fetching", "true")

      try {
        const ctrl = new AbortController()
        const timer = setTimeout(() => ctrl.abort(), 30000)
        const res = await fetch("/api/competitors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brandName: parsed.name,
            competitors: parsed.competitors.slice(0, 3),
          }),
          signal: ctrl.signal,
        })
        clearTimeout(timer)
        const data = await res.json()

        if (data.competitorProfiles && data.competitorProfiles.length > 0) {
          const profiles = data.competitorProfiles.map((cp: Record<string, unknown>) => ({
            ...cp,
            ads: (cp.ads as unknown[]) || [],
            strengths: (cp.strengths as string[]) || [],
            weaknesses: (cp.weaknesses as string[]) || [],
            audienceOverlap: (cp.audienceOverlap as number) || 0,
            adSpend: (cp.adSpend as string) || "Unknown",
            topPlatform: (cp.topPlatform as string) || "Unknown",
          }))

          const updated = { ...parsed, competitorProfiles: profiles }
          sessionStorage.setItem("eds_brand_dna", JSON.stringify(updated))
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.warn("[fetch] Competitor fetch failed (will retry on competitors page):", err)
        }
      } finally {
        sessionStorage.removeItem("eds_competitors_fetching")
      }
    }
  }

  const handleContinue = () => {
    router.push("/competitors")
  }

  if (!brandDna) return null

  return (
    <div className="min-h-screen">
      <StepIndicator />
      {fetchError && (
        <div className="max-w-2xl mx-auto px-4 mb-4">
          <ErrorState message={fetchError} onRetry={retryFetches} />
        </div>
      )}
      <BrandDNACard
        brandDna={brandDna}
        edmundsAds={edmundsAds}
        socialAds={socialAds}
        edmundsMarket={edmundsMarket}
        edmundsAdsLoading={edmundsAdsLoading}
        socialAdsLoading={socialAdsLoading}
        onContinue={handleContinue}
      />
    </div>
  )
}
