"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import PipelineStatusView from "@/components/PipelineStatus"
import { BrandDNA, PipelineStage } from "@/lib/types"

export default function PipelinePage() {
  const router = useRouter()
  const [currentStage, setCurrentStage] = useState<PipelineStage>("creative_brief")
  const [completedStages, setCompletedStages] = useState<PipelineStage[]>([])
  const [stageOutputs, setStageOutputs] = useState<Record<string, unknown>>({})
  const [error, setError] = useState<string>()

  const runPipeline = useCallback(async () => {
    const brandDnaStr = sessionStorage.getItem("eds_brand_dna")
    const description = sessionStorage.getItem("eds_campaign_description")

    if (!brandDnaStr || !description) {
      router.push("/")
      return
    }

    const brandDna: BrandDNA = JSON.parse(brandDnaStr)

    try {
      const response = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandDna, campaignDescription: description }),
      })

      if (!response.ok) throw new Error("Pipeline failed to start")

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response stream")

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        const lines = text.split("\n").filter((l) => l.startsWith("data: "))

        for (const line of lines) {
          const data = JSON.parse(line.slice(6))

          if (data.error) {
            setError(data.error)
            return
          }

          if (data.status === "running") {
            setCurrentStage(data.stage)
          }

          if (data.status === "complete") {
            setCompletedStages((prev) => [...prev, data.stage])
            if (data.output) {
              setStageOutputs((prev) => ({ ...prev, [data.stage]: data.output }))
            }
          }

          if (data.stage === "complete" && data.status === "complete") {
            sessionStorage.setItem(
              "eds_campaign_output",
              JSON.stringify(data.output)
            )
            setTimeout(() => router.push("/review"), 1500)
          }
        }
      }
    } catch (err) {
      setError(String(err))
    }
  }, [router])

  useEffect(() => {
    runPipeline()
  }, [runPipeline])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <PipelineStatusView
        currentStage={currentStage}
        completedStages={completedStages}
        stageOutputs={stageOutputs}
        error={error}
      />
    </div>
  )
}
