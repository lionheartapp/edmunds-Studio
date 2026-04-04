// lib/cta-knowledge-base/index.ts — Public API

import type { CTAEvaluationContext, CTAScoreResult } from "./types"
import type { CtaSuggestion } from "../oem-types"
import { scoreCTA, classifyCTA } from "./scoring"
import {
  suggestAlternatives,
  generateBrandVariants,
  benchmarkAgainstCompetitors,
  identifyCategoryGaps,
} from "./suggestions"

// ─── Public API ─────────────────────────────────────────────

export { scoreCTA } from "./scoring"
export { classifyCTA } from "./scoring"
export { suggestAlternatives, benchmarkAgainstCompetitors, identifyCategoryGaps } from "./suggestions"

export type { CTAEvaluationContext, CTAScoreResult } from "./types"
export type {
  CTACategory,
  VehicleSegment,
  Season,
  Demographic,
  FunnelStage,
} from "./types"

/**
 * Full CTA analysis: score + alternatives + competitor benchmark
 */
export function analyzeCTA(
  ctx: CTAEvaluationContext,
  options?: {
    competitorCTAs?: readonly string[]
    suggestionCount?: number
  }
): {
  score: CTAScoreResult
  category: string
  suggestions: CtaSuggestion[]
  brandVariants: CtaSuggestion[]
  competitorBenchmark?: {
    averageScore: number
    bestCta: string
    bestScore: number
    scores: Array<{ cta: string; score: number }>
  }
  categoryGaps: string[]
} {
  const score = scoreCTA(ctx)
  const category = classifyCTA(ctx.cta)
  const suggestions = suggestAlternatives(ctx, options?.suggestionCount ?? 5)
  const brandVariants = generateBrandVariants(ctx.brandName, ctx.vehicleSegment)

  const competitorCTAs = options?.competitorCTAs ?? []
  const competitorBenchmark = competitorCTAs.length > 0
    ? benchmarkAgainstCompetitors(ctx, competitorCTAs)
    : undefined
  const categoryGaps = identifyCategoryGaps(competitorCTAs)

  return {
    score,
    category,
    suggestions,
    brandVariants,
    competitorBenchmark,
    categoryGaps,
  }
}
