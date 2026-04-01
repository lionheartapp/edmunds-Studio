"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import StrategicEdge from "@/components/StrategicEdge"
import StepIndicator from "@/components/StepIndicator"
import { BrandDNA, StrategicEdge as StrategicEdgeType } from "@/lib/types"

export default function StrategyPage() {
  const router = useRouter()
  const [brandDna, setBrandDna] = useState<BrandDNA | null>(null)
  const [edge, setEdge] = useState<StrategicEdgeType | null>(null)

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
  }, [router])

  const handleLaunchCampaign = () => {
    router.push("/dashboard")
  }

  if (!brandDna || !edge) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-eds-50 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 text-sm">Loading strategic analysis...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <StepIndicator />
      <StrategicEdge
        edge={edge}
        brandName={brandDna.name}
        brandColors={{ primary: brandDna.colors.primary, accent: brandDna.colors.accent }}
        onLaunchCampaign={handleLaunchCampaign}
      />
    </div>
  )
}
