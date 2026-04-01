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
  const prefetchStarted = useRef(false)
  const edmundsFetchStarted = useRef(false)
  const socialFetchStarted = useRef(false)

  useEffect(() => {
    const stored = sessionStorage.getItem("eds_brand_dna")
    if (stored) {
      const parsed = JSON.parse(stored) as BrandDNA

      // ── Load Edmunds market data (set during brand analysis) ──
      const cachedMarket = sessionStorage.getItem("eds_edmunds_market")
      if (cachedMarket) {
        setEdmundsMarket(JSON.parse(cachedMarket))
      }
      setBrandDna(parsed)

      // ── Check for cached Edmunds ads ──
      const cachedEdmunds = sessionStorage.getItem("eds_edmunds_ads")
      if (cachedEdmunds) {
        setEdmundsAds(JSON.parse(cachedEdmunds))
      }

      // ── Prefetch Edmunds ad activity from Databricks ──
      if (!edmundsFetchStarted.current && !cachedEdmunds) {
        edmundsFetchStarted.current = true
        console.log("[prefetch] Starting Edmunds ad activity fetch")

        fetch("/api/edmunds-ads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ make: parsed.name }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.edmundsAds) {
              sessionStorage.setItem("eds_edmunds_ads", JSON.stringify(data.edmundsAds))
              setEdmundsAds(data.edmundsAds)
              console.log(`[prefetch] Edmunds ads ready: ${data.edmundsAds.models?.length || 0} models, source=${data.edmundsAds.source}`)
            }
          })
          .catch(err => {
            console.warn("[prefetch] Edmunds ads fetch failed:", err)
          })
      }

      // ── Prefetch social ads from Meta Ad Library ──
      const cachedSocial = sessionStorage.getItem("eds_social_ads")
      if (cachedSocial) {
        setSocialAds(JSON.parse(cachedSocial))
      }

      if (!socialFetchStarted.current && !cachedSocial) {
        socialFetchStarted.current = true
        console.log("[prefetch] Starting Meta Ad Library fetch")

        fetch("/api/social-ads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brandName: parsed.name, limit: 6 }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.socialAds) {
              sessionStorage.setItem("eds_social_ads", JSON.stringify(data.socialAds))
              setSocialAds(data.socialAds)
              console.log(`[prefetch] Social ads ready: ${data.socialAds.ads?.length || 0} ads, source=${data.socialAds.source}`)
            }
          })
          .catch(err => {
            console.warn("[prefetch] Social ads fetch failed:", err)
          })
      }

      // ── Prefetch competitor profiles in the background ──
      if (
        !prefetchStarted.current &&
        parsed.competitors &&
        parsed.competitors.length > 0 &&
        (!parsed.competitorProfiles || parsed.competitorProfiles.length === 0)
      ) {
        prefetchStarted.current = true
        sessionStorage.setItem("eds_competitors_fetching", "true")
        console.log("[prefetch] Starting competitor profiles fetch in background")

        fetch("/api/competitors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brandName: parsed.name,
            competitors: parsed.competitors.slice(0, 3),
          }),
        })
          .then(res => res.json())
          .then(data => {
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
              console.log(`[prefetch] Competitor profiles ready: ${profiles.length} profiles cached`)
            }
          })
          .catch(err => {
            console.warn("[prefetch] Competitor fetch failed (will retry on competitors page):", err)
          })
          .finally(() => {
            sessionStorage.removeItem("eds_competitors_fetching")
          })
      }
    } else {
      router.push("/")
    }
  }, [router])

  const handleContinue = () => {
    router.push("/competitors")
  }

  const handleEdit = (field: string) => {
    // TODO: Open inline editor for the field
    console.log("Edit field:", field)
  }

  if (!brandDna) return null

  return (
    <div className="min-h-screen">
      <BrandDNACard brandDna={brandDna} edmundsAds={edmundsAds} socialAds={socialAds} edmundsMarket={edmundsMarket} onContinue={handleContinue} onEdit={handleEdit} />
    </div>
  )
}
