// lib/cta-knowledge-base/scoring.ts — Weighted scoring engine

import type {
  CTAEvaluationContext,
  CTAScoreResult,
  RuleScore,
  CTACategory,
} from "./types"
import { CTA_RULES } from "./rules"
import { applyModifiers } from "./modifiers"

// ─── Category Classification ────────────────────────────────

export function classifyCTA(cta: string): CTACategory {
  const lower = cta.toLowerCase()

  if (/build|configure|customize|design|order/.test(lower)) return "configurator"
  if (/\$[\d,]|%|credit|qualify|apr|lease|incentive|bonus|off msrp/i.test(lower)) return "incentive"
  if (/now|today|hurry|limited|last|ends|reserve|lock|claim/i.test(lower)) return "urgency"
  if (/save|value|payment|trade|deal|offer|price|quote|afford/i.test(lower)) return "value"
  if (/experience|dream|feel|discover|exclusive|private|watch|tour/i.test(lower)) return "emotional"
  return "informational"
}

// ─── Evaluate Rules ─────────────────────────────────────────

function evaluateRules(ctx: CTAEvaluationContext): RuleScore[] {
  return CTA_RULES.map((rule) => {
    const rawScore = rule.evaluate(ctx)
    return {
      ruleName: rule.name,
      rawScore,
      weightedScore: rawScore * rule.weight,
      weight: rule.weight,
    }
  })
}

// ─── Derive Strengths & Weaknesses ──────────────────────────

function deriveStrengths(ruleScores: readonly RuleScore[]): string[] {
  return ruleScores
    .filter((rs) => rs.rawScore >= 70)
    .sort((a, b) => b.rawScore - a.rawScore)
    .slice(0, 3)
    .map((rs) => {
      switch (rs.ruleName) {
        case "Action Specificity": return "Strong, specific call-to-action verb"
        case "Funnel Alignment": return "Well-aligned with buyer's journey stage"
        case "Urgency Signal": return "Effective urgency or time-bound language"
        case "Value Clarity": return "Clear value proposition for the shopper"
        case "Platform Fit": return "Optimized length for display ad format"
        case "Emotional Resonance": return "Creates emotional connection with buyer"
        case "Competitive Differentiation": return "Stands out from generic competitor CTAs"
        case "Character Length": return "Ideal character count for readability"
        case "Verb Strength": return "Powerful leading verb drives action"
        default: return `Strong ${rs.ruleName.toLowerCase()}`
      }
    })
}

function deriveWeaknesses(ruleScores: readonly RuleScore[]): string[] {
  return ruleScores
    .filter((rs) => rs.rawScore < 50)
    .sort((a, b) => a.rawScore - b.rawScore)
    .slice(0, 3)
    .map((rs) => {
      switch (rs.ruleName) {
        case "Action Specificity": return "Generic action — consider a more specific verb"
        case "Funnel Alignment": return "Misaligned with typical ad funnel stage"
        case "Urgency Signal": return "No urgency — add time-bound or scarcity language"
        case "Value Clarity": return "No clear value — shoppers don't know the benefit"
        case "Platform Fit": return "Length not optimized for display ad formats"
        case "Emotional Resonance": return "Transactional tone — lacks emotional pull"
        case "Competitive Differentiation": return "Too generic — every competitor uses similar CTAs"
        case "Character Length": return "Character count outside optimal range"
        case "Verb Strength": return "Weak leading verb — use a stronger action word"
        default: return `Weak ${rs.ruleName.toLowerCase()}`
      }
    })
}

// ─── Main Scoring Function ──────────────────────────────────

export function scoreCTA(ctx: CTAEvaluationContext): CTAScoreResult {
  const ruleScores = evaluateRules(ctx)

  // Sum weighted scores for base score
  const baseScore = Math.round(
    ruleScores.reduce((sum, rs) => sum + rs.weightedScore, 0)
  )

  // Apply contextual modifiers
  const { adjustedScore, modifiers } = applyModifiers(baseScore, ctx)

  const strengths = deriveStrengths(ruleScores)
  const weaknesses = deriveWeaknesses(ruleScores)

  return {
    score: adjustedScore,
    ruleScores,
    modifiers,
    strengths,
    weaknesses,
  }
}
