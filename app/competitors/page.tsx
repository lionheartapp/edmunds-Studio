"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence } from "framer-motion"
import CompetitorAnalysis from "@/components/CompetitorAnalysis"
import { BrandDNA } from "@/lib/types"

const EDGE_MESSAGES = [
  "Mapping your strategic advantages...",
  "Finding gaps their ads aren't covering...",
  "Calculating where you can win big...",
  "Turning competitor weaknesses into your opportunities...",
  "Building pre-loaded campaign ideas...",
  "Doing the strategy so the intern doesn't have to...",
]

function EdgeLoader() {
  const [msgIndex, setMsgIndex] = useState(() => Math.floor(Math.random() * EDGE_MESSAGES.length))

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % EDGE_MESSAGES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative w-16 h-16 mb-6">
        {/* Use CSS animations instead of framer-motion for infinite loops */}
        <div className="absolute inset-[-4px] bg-eds-50/20 blur-md animate-blob-glow" />
        <div className="absolute inset-0 bg-eds-50/25 animate-blob-morph" />
        <div className="absolute inset-2 rounded-full border-2 border-eds-60/30 border-t-eds-60/80 animate-spin-slow" />
      </div>
      <p className="text-zinc-200 font-medium mb-2">Strategic Edge</p>
      <div className="h-5 overflow-hidden">
        <AnimatePresence mode="wait">
          <p
            key={msgIndex}
            className="text-sm text-zinc-500 animate-fade-in"
          >
            {EDGE_MESSAGES[msgIndex]}
          </p>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function CompetitorsPage() {
  const router = useRouter()
  const [brandDna, setBrandDna] = useState<BrandDNA | null>(null)
  const [isLoadingCompetitors, setIsLoadingCompetitors] = useState(false)
  const [isLoadingEdge, setIsLoadingEdge] = useState(false)
  const edgePrefetchStarted = useRef(false)
  const abortRef = useRef<AbortController | null>(null)
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([])
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const loadingRef = useRef(false) // avoids stale closure

  // Helper to track intervals/timeouts for cleanup
  const trackInterval = useCallback((id: ReturnType<typeof setInterval>) => {
    intervalsRef.current.push(id)
    return id
  }, [])
  const trackTimeout = useCallback((id: ReturnType<typeof setTimeout>) => {
    timeoutsRef.current.push(id)
    return id
  }, [])

  // ── Prefetch strategic edge once competitor data is ready ──
  const prefetchStrategicEdge = useCallback((dna: BrandDNA) => {
    if (edgePrefetchStarted.current) return
    if (!dna.competitorProfiles || dna.competitorProfiles.length === 0) return
    if (sessionStorage.getItem("eds_strategic_edge")) return

    edgePrefetchStarted.current = true
    sessionStorage.setItem("eds_edge_fetching", "true")
    console.log("[prefetch] Starting strategic edge fetch in background")

    const controller = new AbortController()
    abortRef.current = controller

    fetch("/api/strategic-edge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandDna: dna }),
      signal: controller.signal,
    })
      .then(res => {
        if (!res.ok) throw new Error(`Strategic edge API returned ${res.status}`)
        return res.json()
      })
      .then(data => {
        if (data.edge) {
          sessionStorage.setItem("eds_strategic_edge", JSON.stringify(data.edge))
          console.log("[prefetch] Strategic edge ready and cached")
        }
      })
      .catch(err => {
        if (err.name !== "AbortError") {
          console.warn("[prefetch] Strategic edge failed (will retry on click):", err)
        }
      })
      .finally(() => {
        sessionStorage.removeItem("eds_edge_fetching")
      })
  }, [])

  useEffect(() => {
    // Cleanup all intervals, timeouts, and abort controllers on unmount
    return () => {
      intervalsRef.current.forEach(clearInterval)
      timeoutsRef.current.forEach(clearTimeout)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [])

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
        prefetchStrategicEdge(parsed)
        return
      }

      // No competitor profiles yet
      setBrandDna(parsed)
      setIsLoadingCompetitors(true)
      loadingRef.current = true

      const competitors = parsed.competitors || []
      if (competitors.length === 0) {
        setIsLoadingCompetitors(false)
        loadingRef.current = false
        return
      }

      const prefetchInFlight = sessionStorage.getItem("eds_competitors_fetching") === "true"

      if (prefetchInFlight) {
        console.log("[competitors] Prefetch in-flight, polling for results...")
        const pollInterval = trackInterval(setInterval(() => {
          const fresh = sessionStorage.getItem("eds_brand_dna")
          if (!fresh) return
          const freshParsed = JSON.parse(fresh) as BrandDNA
          if (freshParsed.competitorProfiles && freshParsed.competitorProfiles.length > 0) {
            clearInterval(pollInterval)
            setBrandDna(freshParsed)
            setIsLoadingCompetitors(false)
            loadingRef.current = false
            prefetchStrategicEdge(freshParsed)
            console.log("[competitors] Prefetched data arrived")
          }
          // If the flag is gone but no profiles, the prefetch failed
          if (sessionStorage.getItem("eds_competitors_fetching") !== "true" &&
              (!freshParsed.competitorProfiles || freshParsed.competitorProfiles.length === 0)) {
            clearInterval(pollInterval)
            fetchCompetitors(parsed)
          }
        }, 1000)) // Reduced from 500ms → 1000ms

        // Safety: stop polling after 30s (was 50s) and fetch ourselves
        trackTimeout(setTimeout(() => {
          clearInterval(pollInterval)
          // Use ref instead of stale state closure
          if (loadingRef.current) fetchCompetitors(parsed)
        }, 30000))
      } else {
        fetchCompetitors(parsed)
      }

      function fetchCompetitors(brand: BrandDNA) {
        const controller = new AbortController()
        abortRef.current = controller

        // 30s timeout for competitor fetch
        const timeout = trackTimeout(setTimeout(() => controller.abort(), 30000))

        fetch("/api/competitors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brandName: brand.name,
            competitors: (brand.competitors || []).slice(0, 3),
          }),
          signal: controller.signal,
        })
          .then(res => res.json())
          .then(data => {
            clearTimeout(timeout)
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
            prefetchStrategicEdge(updated)
          })
          .catch(err => {
            if (err.name !== "AbortError") {
              console.error("Failed to fetch competitor profiles:", err)
            }
          })
          .finally(() => {
            setIsLoadingCompetitors(false)
            loadingRef.current = false
          })
      }

    } catch (e) {
      console.error("Failed to parse brand DNA:", e)
      router.push("/")
    }
  }, [router, prefetchStrategicEdge, trackInterval, trackTimeout])

  const handleContinue = async () => {
    if (!brandDna) return

    // Check if strategic edge is already cached from prefetch
    const cached = sessionStorage.getItem("eds_strategic_edge")
    if (cached) {
      console.log("[competitors] Strategic edge already cached — instant navigation")
      router.push("/strategy")
      return
    }

    // Check if prefetch is in-flight — wait for it instead of firing a duplicate
    if (sessionStorage.getItem("eds_edge_fetching") === "true") {
      setIsLoadingEdge(true)
      console.log("[competitors] Edge prefetch in-flight, waiting...")
      const poll = trackInterval(setInterval(() => {
        if (sessionStorage.getItem("eds_strategic_edge")) {
          clearInterval(poll)
          setIsLoadingEdge(false)
          router.push("/strategy")
        }
        if (sessionStorage.getItem("eds_edge_fetching") !== "true" &&
            !sessionStorage.getItem("eds_strategic_edge")) {
          clearInterval(poll)
          doEdgeFetch()
        }
      }, 1000)) // Reduced from 500ms
      // Safety timeout at 30s (was 50s)
      trackTimeout(setTimeout(() => { clearInterval(poll); doEdgeFetch() }, 30000))
      return
    }

    doEdgeFetch()

    async function doEdgeFetch() {
      setIsLoadingEdge(true)
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)

      try {
        const response = await fetch("/api/strategic-edge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brandDna }),
          signal: controller.signal,
        })

        clearTimeout(timeout)
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
          <EdgeLoader />
        </div>
      )}
    </div>
  )
}
