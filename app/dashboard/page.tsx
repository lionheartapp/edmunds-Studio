"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import CampaignDashboard from "@/components/CampaignDashboard"
import StepIndicator from "@/components/StepIndicator"
import { BrandDNA, StrategicEdge, PreBuiltCampaign } from "@/lib/types"

export default function DashboardPage() {
  const router = useRouter()
  const [brandDna, setBrandDna] = useState<BrandDNA | null>(null)
  const [edge, setEdge] = useState<StrategicEdge | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const storedDna = sessionStorage.getItem("eds_brand_dna")
    const storedEdge = sessionStorage.getItem("eds_strategic_edge")

    if (storedDna) {
      setBrandDna(JSON.parse(storedDna))
    } else {
      router.push("/")
      return
    }

    if (storedEdge) {
      setEdge(JSON.parse(storedEdge))
    }

    setReady(true)
  }, [router])

  const handlePlaceOnEdmunds = (campaign: PreBuiltCampaign) => {
    // Store selected campaign and navigate to placement flow
    sessionStorage.setItem("eds_selected_campaign", JSON.stringify(campaign))
    router.push("/placement")
  }

  if (!ready || !brandDna) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-eds-50 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 text-sm">Preparing your dashboard...</p>
        </div>
      </div>
    )
  }

  // If we don't have edge data, create a minimal fallback
  const edgeData: StrategicEdge = edge || {
    opportunities: [],
    overallStrategy: "Complete the onboarding flow to unlock AI-generated strategic insights.",
    quickWins: [],
    preBuiltCampaigns: [],
  }

  return (
    <div className="min-h-screen">
      <StepIndicator />
      <CampaignDashboard
        brandDna={brandDna}
        edge={edgeData}
        showDrawerOnMount={true}
        onPlaceOnEdmunds={handlePlaceOnEdmunds}
      />
    </div>
  )
}
