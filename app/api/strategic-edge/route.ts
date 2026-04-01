// app/api/strategic-edge/route.ts — Strategic Edge Analysis Endpoint

import { NextRequest, NextResponse } from "next/server"
import { askAIJSON, isAIConfigured } from "@/lib/ai"
import {
  STRATEGIC_EDGE_SYSTEM_PROMPT,
  STRATEGIC_EDGE_USER_PROMPT,
} from "@/prompts/brand-dna"
import { StrategicEdge } from "@/lib/types"

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const { brandDna } = await request.json()

    if (!brandDna) {
      return NextResponse.json(
        { error: "Brand DNA is required" },
        { status: 400 }
      )
    }

    if (!isAIConfigured()) {
      return NextResponse.json(
        { error: "No AI API key configured." },
        { status: 503 }
      )
    }

    console.log(`[strategic-edge] Analyzing opportunities for: ${brandDna.name}`)

    const edge = await askAIJSON<StrategicEdge>(
      STRATEGIC_EDGE_SYSTEM_PROMPT,
      STRATEGIC_EDGE_USER_PROMPT(JSON.stringify(brandDna)),
      { temperature: 0.7, maxTokens: 8192 }
    )

    console.log(`[strategic-edge] Found ${edge.opportunities?.length || 0} opportunities, ${edge.preBuiltCampaigns?.length || 0} pre-built campaigns`)

    return NextResponse.json({ edge })
  } catch (error) {
    console.error("[strategic-edge] Error:", error)
    return NextResponse.json(
      { error: "Failed to generate strategic analysis" },
      { status: 500 }
    )
  }
}
