"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import BrandDNACard from "@/components/BrandDNACard"
import { BrandDNA } from "@/lib/types"

export default function OnboardPage() {
  const router = useRouter()
  const [brandDna, setBrandDna] = useState<BrandDNA | null>(null)
  const prefetchStarted = useRef(false)

  useEffect(() => {
    const stored = sessionStorage.getItem("eds_brand_dna")
    if (stored) {
      const parsed = JSON.parse(stored) as BrandDNA
      setBrandDna(parsed)

      // ── Prefetch competitor profiles in the background ──
      // The competitors page checks sessionStorage first, so if this
      // finishes before the user navigates, it's instant.
      if (
        !prefetchStarted.current &&
        parsed.competitors &&
        parsed.competitors.length > 0 &&
        (!parsed.competitorProfiles || parsed.competitorProfiles.length === 0)
      ) {
        prefetchStarted.current = true
        // Mark that a fetch is in-flight so the competitors page doesn't duplicate it
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

              // Merge into stored brand DNA so competitors page finds it
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
      <BrandDNACard brandDna={brandDna} onContinue={handleContinue} onEdit={handleEdit} />
    </div>
  )
}
