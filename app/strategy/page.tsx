"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import StrategicEdge from "@/components/StrategicEdge"
import StepIndicator from "@/components/StepIndicator"
import ErrorState from "@/components/ErrorState"
import FullPageLoader from "@/components/FullPageLoader"
import { BrandDNA, StrategicEdge as StrategicEdgeType } from "@/lib/types"

const STRATEGY_MESSAGES = [
  "Mapping your strategic advantages...",
  "Finding gaps their ads aren't covering...",
  "Calculating where you can win big...",
  "Turning competitor weaknesses into your opportunities...",
  "Building pre-loaded campaign ideas...",
  "Doing the strategy so the intern doesn't have to...",
]

export default function StrategyPage() {
  const router = useRouter()
  const [brandDna, setBrandDna] = useState<BrandDNA | null>(null)
  const [edge, setEdge] = useState<StrategicEdgeType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const fetchStarted = useRef(false)

  const fetchStrategicEdge = useCallback(async (dna: BrandDNA) => {
    try {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 30000)

      const res = await fetch("/api/strategic-edge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandDna: dna }),
        signal: ctrl.signal,
      })
      clearTimeout(timer)

      if (!res.ok) throw new Error(`Strategic edge API returned ${res.status}`)

      const data = await res.json()
      if (data.edge) {
        sessionStorage.setItem("eds_strategic_edge", JSON.stringify(data.edge))
        setEdge(data.edge)
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Strategic edge fetch failed:", err)
        setFetchError("Failed to load strategic analysis.")
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const storedDna = sessionStorage.getItem("eds_brand_dna")
    if (!storedDna) {
      router.push("/")
      return
    }

    const parsedDna = JSON.parse(storedDna) as BrandDNA
    setBrandDna(parsedDna)

    // Check for cached strategic edge
    const storedEdge = sessionStorage.getItem("eds_strategic_edge")
    if (storedEdge) {
      setEdge(JSON.parse(storedEdge))
      setIsLoading(false)
      return
    }

    if (fetchStarted.current) return
    fetchStarted.current = true
    fetchStrategicEdge(parsedDna)
  }, [router, fetchStrategicEdge])

  const handleRetry = useCallback(() => {
    if (!brandDna) return
    setFetchError(null)
    setIsLoading(true)
    fetchStarted.current = false
    fetchStrategicEdge(brandDna)
  }, [brandDna, fetchStrategicEdge])

  const handleLaunchCampaign = () => {
    router.push("/dashboard")
  }

  if (!brandDna) return null

  if (isLoading) {
    return (
      <FullPageLoader
        title="Crafting your strategic edge..."
        messages={STRATEGY_MESSAGES}
      />
    )
  }

  if (fetchError || !edge) {
    return (
      <div className="min-h-screen">
        <StepIndicator />
        <div className="max-w-2xl mx-auto px-4 py-20">
          <ErrorState
            message={fetchError || "Strategic analysis not available."}
            onRetry={handleRetry}
          />
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
