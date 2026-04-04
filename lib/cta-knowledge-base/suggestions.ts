// lib/cta-knowledge-base/suggestions.ts — Alternative CTA generation + competitor benchmarking

import type {
  CTAEvaluationContext,
  CTASeedEntry,
  CTACategory,
  VehicleSegment,
} from "./types"
import type { CtaSuggestion } from "../oem-types"
import { CTA_SEED_DATA } from "./seed-data"
import { scoreCTA, classifyCTA } from "./scoring"

// ─── Find Similar CTAs from Seed Data ───────────────────────

function findRelevantSeeds(
  ctx: CTAEvaluationContext,
  excludeCta: string,
  limit: number
): readonly CTASeedEntry[] {
  const currentCategory = classifyCTA(ctx.cta)

  return CTA_SEED_DATA
    .filter((seed) => seed.cta.toLowerCase() !== excludeCta.toLowerCase())
    .map((seed) => {
      let relevance = 0

      // Same segment match
      if (ctx.vehicleSegment && seed.segments.includes(ctx.vehicleSegment)) {
        relevance += 3
      }

      // Same season match
      if (ctx.season && seed.seasons.includes(ctx.season)) {
        relevance += 2
      }

      // Different category = more diverse suggestion
      if (seed.category !== currentCategory) {
        relevance += 1
      }

      // Higher base score = better suggestion
      relevance += seed.score / 25

      return { seed, relevance }
    })
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit)
    .map((entry) => entry.seed)
}

// ─── Generate Alternative CTAs ──────────────────────────────

export function suggestAlternatives(
  ctx: CTAEvaluationContext,
  count: number = 5
): CtaSuggestion[] {
  const seeds = findRelevantSeeds(ctx, ctx.cta, count)

  return seeds.map((seed) => {
    // Re-score with full context
    const result = scoreCTA({
      ...ctx,
      cta: seed.cta,
    })

    return {
      cta: seed.cta,
      score: result.score,
      reason: seed.whyItWorks,
      category: seed.category as CtaSuggestion["category"],
    }
  })
}

// ─── Generate Brand-Specific CTA Variants ───────────────────

export function generateBrandVariants(
  brandName: string,
  vehicleSegment?: VehicleSegment
): CtaSuggestion[] {
  const templates = getTemplatesForSegment(vehicleSegment)

  return templates.map((template) => {
    const cta = template.template.replace("{brand}", brandName)
    const ctx: CTAEvaluationContext = {
      cta,
      brandName,
      vehicleSegment,
    }
    const result = scoreCTA(ctx)

    return {
      cta,
      score: result.score,
      reason: template.reason,
      category: template.category,
    }
  })
}

interface CTATemplate {
  template: string
  category: CtaSuggestion["category"]
  reason: string
}

function getTemplatesForSegment(segment?: VehicleSegment): CTATemplate[] {
  const base: CTATemplate[] = [
    { template: "Build & Price Your {brand}", category: "configurator", reason: "Configurator CTAs drive 2.3x longer session times" },
    { template: "See {brand} Offers Near You", category: "value", reason: "Local + value combination increases click-through 1.8x" },
    { template: "Schedule Your {brand} Test Drive", category: "urgency", reason: "Commitment-oriented CTA with clear next step" },
  ]

  switch (segment) {
    case "truck":
      return [
        ...base,
        { template: "Configure Your {brand} Truck", category: "configurator", reason: "Truck buyers spend 3x longer in configurators than other segments" },
        { template: "Compare {brand} Towing Specs", category: "informational", reason: "Capability comparison is the #1 truck research activity" },
      ]
    case "ev":
      return [
        ...base,
        { template: "Check Your {brand} EV Tax Credit", category: "incentive", reason: "EV incentive CTAs have 2.5x higher CTR than generic" },
        { template: "Calculate {brand} Charging Costs", category: "value", reason: "Total cost of ownership is the primary EV consideration" },
      ]
    case "luxury":
      return [
        ...base,
        { template: "Book Your Private {brand} Experience", category: "emotional", reason: "Exclusivity framing drives 3x higher lead quality in luxury" },
        { template: "Explore {brand} Craftsmanship", category: "emotional", reason: "Craftsmanship messaging resonates with luxury consideration" },
      ]
    case "sports":
      return [
        ...base,
        { template: "Watch {brand} Performance in Action", category: "emotional", reason: "Video performance content drives highest sports car engagement" },
        { template: "Reserve Your {brand} Allocation", category: "urgency", reason: "Scarcity framing matches sports car market reality" },
      ]
    default:
      return [
        ...base,
        { template: "See What's New from {brand}", category: "informational", reason: "New model awareness CTA for broad audience" },
        { template: "Find Your Perfect {brand}", category: "emotional", reason: "Personal matching language increases engagement" },
      ]
  }
}

// ─── Competitor CTA Benchmarking ────────────────────────────

export function benchmarkAgainstCompetitors(
  ctx: CTAEvaluationContext,
  competitorCTAs: readonly string[]
): {
  averageScore: number
  bestCta: string
  bestScore: number
  scores: Array<{ cta: string; score: number }>
} {
  if (competitorCTAs.length === 0) {
    return { averageScore: 0, bestCta: "", bestScore: 0, scores: [] }
  }

  const scores = competitorCTAs.map((cta) => {
    const result = scoreCTA({ ...ctx, cta })
    return { cta, score: result.score }
  })

  const sorted = [...scores].sort((a, b) => b.score - a.score)
  const averageScore = Math.round(
    scores.reduce((sum, s) => sum + s.score, 0) / scores.length
  )

  return {
    averageScore,
    bestCta: sorted[0]?.cta ?? "",
    bestScore: sorted[0]?.score ?? 0,
    scores,
  }
}

// ─── Identify Category Gaps ─────────────────────────────────

export function identifyCategoryGaps(
  competitorCTAs: readonly string[]
): string[] {
  const allCategories: CTACategory[] = [
    "urgency", "value", "configurator", "incentive", "emotional", "informational",
  ]

  const usedCategories = new Set(
    competitorCTAs.map((cta) => classifyCTA(cta))
  )

  const gaps = allCategories.filter((cat) => !usedCategories.has(cat))

  return gaps.map((gap) => {
    switch (gap) {
      case "configurator": return "No competitor is using configurator CTAs — high-engagement opportunity"
      case "incentive": return "No competitor is promoting specific incentives — value gap to exploit"
      case "urgency": return "No urgency-based CTAs in competitive set — scarcity messaging opportunity"
      case "value": return "No value/savings CTAs from competitors — price transparency gap"
      case "emotional": return "No emotional/aspirational CTAs in market — storytelling opportunity"
      case "informational": return "All competitors are action-heavy — educational content could differentiate"
    }
  })
}
