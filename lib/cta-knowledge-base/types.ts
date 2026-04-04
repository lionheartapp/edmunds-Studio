// lib/cta-knowledge-base/types.ts — CTA Scoring System Types

export interface CTARule {
  name: string
  weight: number // 0-1, sum of all weights = 1
  evaluate: (ctx: CTAEvaluationContext) => number // 0-100 raw score
  description: string
}

export interface CTAEvaluationContext {
  cta: string
  brandName: string
  vehicleSegment?: VehicleSegment
  season?: Season
  demographic?: Demographic
  funnelStage?: FunnelStage
}

export interface CTAScoreResult {
  score: number // 0-100 final weighted score
  ruleScores: RuleScore[]
  modifiers: AppliedModifier[]
  strengths: string[]
  weaknesses: string[]
}

export interface RuleScore {
  ruleName: string
  rawScore: number
  weightedScore: number
  weight: number
}

export interface AppliedModifier {
  type: "seasonal" | "demographic" | "segment"
  name: string
  adjustment: number
  reason: string
}

export interface CTASeedEntry {
  cta: string
  score: number
  category: CTACategory
  segments: VehicleSegment[]
  seasons: Season[]
  funnelStages: FunnelStage[]
  whyItWorks: string
}

export type CTACategory =
  | "urgency"
  | "value"
  | "configurator"
  | "incentive"
  | "emotional"
  | "informational"

export type VehicleSegment =
  | "truck"
  | "sedan"
  | "suv"
  | "luxury"
  | "ev"
  | "sports"
  | "minivan"

export type Season = "Q1" | "Q2" | "Q3" | "Q4"

export type Demographic =
  | "gen_z"
  | "millennial"
  | "gen_x"
  | "boomer"

export type FunnelStage =
  | "awareness"
  | "consideration"
  | "intent"
  | "purchase"
