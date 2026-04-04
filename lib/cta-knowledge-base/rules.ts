// lib/cta-knowledge-base/rules.ts — 9 CTA Scoring Rules

import type { CTARule, CTAEvaluationContext } from "./types"

const STRONG_VERBS = [
  "build", "configure", "customize", "design", "reserve", "claim",
  "unlock", "calculate", "schedule", "compare", "lock", "save",
  "get", "see", "watch", "discover", "start", "book", "join",
  "estimate", "find", "apply", "trade", "lease", "experience",
]

const WEAK_VERBS = [
  "learn", "browse", "view", "visit", "click", "submit", "explore",
  "contact", "sign", "download", "check",
]

const URGENCY_WORDS = [
  "now", "today", "this weekend", "limited", "hurry", "last chance",
  "ends", "before", "while", "don't miss", "only", "act",
]

const VALUE_WORDS = [
  "$", "%", "save", "free", "bonus", "offer", "deal", "discount",
  "off", "credit", "qualify", "apr", "payment", "price", "value",
]

function containsAny(text: string, words: readonly string[]): boolean {
  const lower = text.toLowerCase()
  return words.some((w) => lower.includes(w))
}

function countMatches(text: string, words: readonly string[]): number {
  const lower = text.toLowerCase()
  return words.filter((w) => lower.includes(w)).length
}

// ─── Rule 1: Action Specificity ─────────────────────────────
// Does the CTA describe a specific action vs. generic browsing?

const actionSpecificity: CTARule = {
  name: "Action Specificity",
  weight: 0.18,
  description: "Measures how specific and actionable the CTA verb is",
  evaluate: (ctx: CTAEvaluationContext): number => {
    const { cta } = ctx
    const lower = cta.toLowerCase()

    // Highest: configurator/tool actions
    if (/build|configure|customize|design|calculate|estimate/.test(lower)) return 95
    // High: commitment actions
    if (/reserve|claim|lock|book|schedule|start|order/.test(lower)) return 85
    // Medium: discovery with specificity
    if (/compare|find|see .+ (near|in|for)/.test(lower)) return 70
    // Low: generic actions
    if (/shop|explore|browse|view|check/.test(lower)) return 40
    // Worst: non-actions
    if (/learn|click|visit|submit|sign up/.test(lower)) return 20

    return 50 // default mid
  },
}

// ─── Rule 2: Funnel Alignment ───────────────────────────────
// Is the CTA appropriate for the implied funnel stage?

const funnelAlignment: CTARule = {
  name: "Funnel Alignment",
  weight: 0.12,
  description: "Evaluates whether CTA matches likely funnel stage in ad context",
  evaluate: (ctx: CTAEvaluationContext): number => {
    const { cta, funnelStage } = ctx
    const lower = cta.toLowerCase()

    const isAwareness = /explore|discover|learn|watch|experience|see the/.test(lower)
    const isConsideration = /compare|find|browse|check|review|estimate/.test(lower)
    const isIntent = /build|configure|schedule|book|calculate|customize/.test(lower)
    const isPurchase = /reserve|claim|lock|order|apply|lease|get .+\$/.test(lower)

    if (!funnelStage) {
      // Without explicit stage, reward mid-to-low funnel (ads should drive action)
      if (isPurchase) return 90
      if (isIntent) return 80
      if (isConsideration) return 60
      if (isAwareness) return 40
      return 55
    }

    const stageMap: Record<string, boolean> = {
      awareness: isAwareness,
      consideration: isConsideration,
      intent: isIntent,
      purchase: isPurchase,
    }

    return stageMap[funnelStage] ? 90 : 50
  },
}

// ─── Rule 3: Urgency Signal ────────────────────────────────

const urgencySignal: CTARule = {
  name: "Urgency Signal",
  weight: 0.10,
  description: "Presence of time-limited or scarcity language",
  evaluate: (ctx: CTAEvaluationContext): number => {
    const { cta } = ctx
    const matches = countMatches(cta, URGENCY_WORDS)
    if (matches >= 2) return 95
    if (matches === 1) return 75
    return 35 // No urgency isn't terrible, just not optimal for ads
  },
}

// ─── Rule 4: Value Clarity ─────────────────────────────────

const valueClarity: CTARule = {
  name: "Value Clarity",
  weight: 0.14,
  description: "Does the CTA communicate a clear benefit or value to the shopper?",
  evaluate: (ctx: CTAEvaluationContext): number => {
    const { cta } = ctx
    const lower = cta.toLowerCase()

    // Specific dollar/percent value
    if (/\$[\d,]+|\d+%/.test(cta)) return 95
    // Monthly payment
    if (/\$\d+\/mo/.test(lower)) return 90
    // Value words without specific numbers
    if (containsAny(cta, VALUE_WORDS)) return 70
    // Implied value (personal result)
    if (/your|you/.test(lower)) return 55
    // No value signal
    return 30
  },
}

// ─── Rule 5: Platform Fit ──────────────────────────────────
// Edmunds display ads have limited space — shorter CTAs perform better

const platformFit: CTARule = {
  name: "Platform Fit",
  weight: 0.10,
  description: "CTA length and complexity appropriate for Edmunds display ads",
  evaluate: (ctx: CTAEvaluationContext): number => {
    const { cta } = ctx
    const len = cta.length
    const wordCount = cta.split(/\s+/).length

    // Sweet spot: 3-6 words, 15-35 characters
    if (len >= 15 && len <= 35 && wordCount >= 3 && wordCount <= 6) return 90
    // Acceptable
    if (len >= 10 && len <= 45 && wordCount >= 2 && wordCount <= 8) return 70
    // Too short (no info) or too long (won't fit)
    if (len < 10) return 40
    if (len > 45) return 30

    return 60
  },
}

// ─── Rule 6: Emotional Resonance ───────────────────────────

const emotionalResonance: CTARule = {
  name: "Emotional Resonance",
  weight: 0.10,
  description: "Does the CTA trigger an emotional response or aspiration?",
  evaluate: (ctx: CTAEvaluationContext): number => {
    const { cta } = ctx
    const lower = cta.toLowerCase()

    // Ownership/aspiration language
    if (/your dream|your .+ (truck|car|suv|vehicle)/.test(lower)) return 90
    // Personal possessive
    if (/your|you'll|yours/.test(lower)) return 70
    // Experiential
    if (/experience|feel|drive|ride|see it/.test(lower)) return 65
    // Exclusivity
    if (/unlock|exclusive|private|vip|first/.test(lower)) return 75
    // Neutral/transactional
    return 35
  },
}

// ─── Rule 7: Competitive Differentiation ───────────────────

const competitiveDifferentiation: CTARule = {
  name: "Competitive Differentiation",
  weight: 0.08,
  description: "Does the CTA stand out from generic automotive CTAs?",
  evaluate: (ctx: CTAEvaluationContext): number => {
    const { cta } = ctx
    const lower = cta.toLowerCase()

    // Generic CTAs every OEM uses — low differentiation
    const genericPatterns = [
      "learn more", "get more info", "click here", "visit website",
      "contact us", "sign up", "submit", "browse", "explore",
      "shop now", "view", "download",
    ]
    if (genericPatterns.some((p) => lower === p || lower.startsWith(p))) return 15

    // Model-specific CTAs — high differentiation
    if (/[A-Z][a-z]+([\s-][A-Z0-9])?/.test(cta) && cta.length > 15) return 85

    // Action-specific but no model name
    if (containsAny(cta, STRONG_VERBS) && !containsAny(cta, WEAK_VERBS)) return 65

    return 45
  },
}

// ─── Rule 8: Character Length ──────────────────────────────

const characterLength: CTARule = {
  name: "Character Length",
  weight: 0.08,
  description: "Optimal character count for display ad CTAs",
  evaluate: (ctx: CTAEvaluationContext): number => {
    const len = ctx.cta.length

    if (len >= 20 && len <= 30) return 95 // Optimal
    if (len >= 15 && len <= 35) return 85 // Good
    if (len >= 10 && len <= 40) return 70 // Acceptable
    if (len < 10) return 35 // Too short
    if (len > 50) return 25 // Too long for display
    return 55
  },
}

// ─── Rule 9: Verb Strength ─────────────────────────────────

const verbStrength: CTARule = {
  name: "Verb Strength",
  weight: 0.10,
  description: "Power of the leading verb in the CTA",
  evaluate: (ctx: CTAEvaluationContext): number => {
    const { cta } = ctx
    const firstWord = cta.split(/\s+/)[0]?.toLowerCase() ?? ""

    if (STRONG_VERBS.includes(firstWord)) return 90
    if (WEAK_VERBS.includes(firstWord)) return 30

    // Check if any strong verb appears
    if (containsAny(cta, STRONG_VERBS)) return 70
    if (containsAny(cta, WEAK_VERBS)) return 40

    return 50
  },
}

// ─── Export All Rules ──────────────────────────────────────

export const CTA_RULES: readonly CTARule[] = [
  actionSpecificity,
  funnelAlignment,
  urgencySignal,
  valueClarity,
  platformFit,
  emotionalResonance,
  competitiveDifferentiation,
  characterLength,
  verbStrength,
] as const
