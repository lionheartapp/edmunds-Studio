// app/api/oem/cta-score/route.ts — Score and suggest CTAs using the knowledge base

import { NextResponse } from "next/server"
import { analyzeCTA } from "@/lib/cta-knowledge-base"
import type { CTAEvaluationContext, VehicleSegment, Season, Demographic } from "@/lib/cta-knowledge-base"
import type { CtaScoreRequest, CtaScoreResponse } from "@/lib/oem-types"

export const maxDuration = 15

export async function POST(request: Request) {
  try {
    const body: CtaScoreRequest = await request.json()

    if (!body.cta || !body.brandName) {
      return NextResponse.json(
        { error: "Missing cta or brandName" },
        { status: 400 }
      )
    }

    // Build evaluation context
    const ctx: CTAEvaluationContext = {
      cta: body.cta,
      brandName: body.brandName,
      vehicleSegment: body.vehicleSegment as VehicleSegment | undefined,
      season: (body.season as Season) ?? getCurrentSeason(),
      demographic: body.demographic as Demographic | undefined,
    }

    // Run full analysis
    const analysis = analyzeCTA(ctx, {
      competitorCTAs: body.competitorCTAs,
      suggestionCount: 5,
    })

    const response: CtaScoreResponse = {
      score: analysis.score.score,
      strengths: analysis.score.strengths,
      weaknesses: analysis.score.weaknesses,
      suggestions: [
        ...analysis.suggestions,
        ...analysis.brandVariants,
      ]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5),
      competitorBenchmark: analysis.competitorBenchmark
        ? {
            averageScore: analysis.competitorBenchmark.averageScore,
            bestCta: analysis.competitorBenchmark.bestCta,
            bestScore: analysis.competitorBenchmark.bestScore,
          }
        : undefined,
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error("[api/oem/cta-score] Error:", err)
    return NextResponse.json(
      { error: "CTA scoring failed" },
      { status: 500 }
    )
  }
}

function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1 // 1-12
  if (month <= 3) return "Q1"
  if (month <= 6) return "Q2"
  if (month <= 9) return "Q3"
  return "Q4"
}
