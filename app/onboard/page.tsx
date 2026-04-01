"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import BrandDNACard from "@/components/BrandDNACard"
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

    // ── Sequential fetch pipeline ──
    // Each section loads one at a time with its own loading state.
    // This avoids hammering the server and creates a nice reveal experience.
    runSequentialFetches(parsed, !!cachedEdmunds, !!cachedSocial)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  async function runSequentialFetches(
    parsed: BrandDNA,
    hasEdmunds: boolean,
    hasSocial: boolean,
  ) {
    // ── Step 1: Edmunds ad activity from Databricks ──
    if (!hasEdmunds) {
      setEdmundsAdsLoading(true)
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
          console.log(`[fetch] Edmunds ads ready: ${data.edmundsAds.models?.length || 0} models, source=${data.edmundsAds.source}`)
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.warn("[fetch] Edmunds ads failed:", err)
        }
      } finally {
        setEdmundsAdsLoading(false)
      }
    }

    // ── Step 2: Social ads from Meta Ad Library ──
    if (!hasSocial) {
      setSocialAdsLoading(true)
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
          console.log(`[fetch] Social ads ready: ${data.socialAds.ads?.length || 0} ads, source=${data.socialAds.source}`)
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.warn("[fetch] Social ads failed:", err)
        }
      } finally {
        setSocialAdsLoading(false)
      }
    }

    // ── Step 3: Competitors — deferred background prefetch ──
    // This data isn't shown on this page, so fetch it quietly after visible data loads
    if (
      parsed.competitors &&
      parsed.competitors.length > 0 &&
      (!parsed.competitorProfiles || parsed.competitorProfiles.length === 0)
    ) {
      sessionStorage.setItem("eds_competitors_fetching", "true")
      console.log("[fetch] Starting deferred competitor profiles fetch")

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
          console.log(`[fetch] Competitor profiles ready: ${profiles.length} profiles cached`)
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

  const handleEdit = (field: string) => {
    console.log("Edit field:", field)
  }

  if (!brandDna) return null

  return (
    <div className="min-h-screen">
      <BrandDNACard
        brandDna={brandDna}
        edmundsAds={edmundsAds}
        socialAds={socialAds}
        edmundsMarket={edmundsMarket}
        edmundsAdsLoading={edmundsAdsLoading}
        socialAdsLoading={socialAdsLoading}
        onContinue={handleContinue}
        onEdit={handleEdit}
      />
    </div>
  )
}
