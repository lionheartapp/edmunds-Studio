// lib/cta-knowledge-base/modifiers.ts — Seasonal, demographic, and segment modifiers

import type {
  CTAEvaluationContext,
  AppliedModifier,
  Season,
  Demographic,
  VehicleSegment,
} from "./types"

// ─── Seasonal Modifiers ─────────────────────────────────────

interface SeasonalRule {
  season: Season
  patterns: RegExp
  adjustment: number
  reason: string
}

const SEASONAL_RULES: readonly SeasonalRule[] = [
  // Q4: Year-end clearance, urgency CTAs shine
  { season: "Q4", patterns: /now|today|this weekend|hurry|last chance|ends|claim|lock/i, adjustment: +15, reason: "Urgency CTAs convert 2.1x better during year-end clearance" },
  { season: "Q4", patterns: /bonus|year-end|holiday|season/i, adjustment: +12, reason: "Seasonal framing aligns with year-end buying psychology" },
  { season: "Q4", patterns: /\$[\d,]+\s*off|save \$/i, adjustment: +10, reason: "Specific discounts resonate strongly in clearance season" },

  // Q1: Post-holiday reset, buyers are less impulsive
  { season: "Q1", patterns: /now|hurry|last chance|limited/i, adjustment: -5, reason: "Urgency fatigue after holiday season, shoppers are more deliberate in Q1" },
  { season: "Q1", patterns: /new model|all-new|redesigned|2026|2027/i, adjustment: +10, reason: "New model year launches align with Q1 reveal season" },
  { season: "Q1", patterns: /tax|credit|refund|qualify/i, adjustment: +12, reason: "Tax refund season drives financing and incentive interest" },

  // Q2: Spring selling season, balance of urgency and value
  { season: "Q2", patterns: /apr|financing|payment|lease/i, adjustment: +8, reason: "Spring selling events with competitive financing offers" },
  { season: "Q2", patterns: /test drive|schedule|visit/i, adjustment: +6, reason: "Spring weather increases showroom visit willingness" },

  // Q3: Model year transition, deals on outgoing models
  { season: "Q3", patterns: /remaining|last|clearance|outgoing/i, adjustment: +10, reason: "Model year transition creates genuine scarcity of current stock" },
  { season: "Q3", patterns: /build|order|configure|customize/i, adjustment: +8, reason: "Build-to-order gains appeal as lot inventory thins" },
]

// ─── Demographic Modifiers ──────────────────────────────────

interface DemographicRule {
  demographic: Demographic
  patterns: RegExp
  adjustment: number
  reason: string
}

const DEMOGRAPHIC_RULES: readonly DemographicRule[] = [
  // Gen Z: digital-first, sustainability-conscious, experience-oriented
  { demographic: "gen_z", patterns: /experience|watch|virtual|tour|ar|see it/i, adjustment: +10, reason: "Gen Z favors digital-first, experiential engagement" },
  { demographic: "gen_z", patterns: /sustainable|ev|electric|eco|green/i, adjustment: +8, reason: "Sustainability messaging resonates with Gen Z values" },
  { demographic: "gen_z", patterns: /download|brochure|call/i, adjustment: -8, reason: "Traditional channels underperform with Gen Z" },

  // Millennial: value-conscious, research-heavy, tech-savvy
  { demographic: "millennial", patterns: /compare|review|calculate|estimate/i, adjustment: +8, reason: "Millennials are research-driven, tool-based CTAs align" },
  { demographic: "millennial", patterns: /qualify|payment|save|trade/i, adjustment: +6, reason: "Value transparency appeals to financially aware millennials" },
  { demographic: "millennial", patterns: /\$[\d,]+\/mo|payment|monthly/i, adjustment: +10, reason: "Monthly cost framing preferred over total price" },

  // Gen X: practical, family-focused, reliability-conscious
  { demographic: "gen_x", patterns: /safe|reliable|family|certified|warranty/i, adjustment: +8, reason: "Reliability and family safety messaging resonates with Gen X" },
  { demographic: "gen_x", patterns: /trade|upgrade|value/i, adjustment: +6, reason: "Trade-in and upgrade paths appeal to replacement buyers" },

  // Boomer: brand-loyal, deal-conscious, in-person preference
  { demographic: "boomer", patterns: /schedule|visit|call|test drive/i, adjustment: +8, reason: "In-person experience CTAs align with boomer shopping preferences" },
  { demographic: "boomer", patterns: /loyal|reward|exclusive|member/i, adjustment: +10, reason: "Loyalty and exclusivity framing resonates with brand-loyal boomers" },
  { demographic: "boomer", patterns: /virtual|ar|app|download/i, adjustment: -6, reason: "Digital-heavy CTAs create friction for less tech-forward segment" },
]

// ─── Vehicle Segment Modifiers ──────────────────────────────

interface SegmentRule {
  segment: VehicleSegment
  patterns: RegExp
  adjustment: number
  reason: string
}

const SEGMENT_RULES: readonly SegmentRule[] = [
  // Truck: customization culture, capability focus, loyalty
  { segment: "truck", patterns: /build|configure|customize/i, adjustment: +12, reason: "Truck buyers expect deep customization — Build & Price is core to truck shopping" },
  { segment: "truck", patterns: /tow|haul|payload|capability|power/i, adjustment: +8, reason: "Capability language speaks to truck buyer priorities" },
  { segment: "truck", patterns: /compare.*vs/i, adjustment: +6, reason: "Truck segment has fierce brand loyalty — comparison content drives engagement" },

  // SUV: family-oriented, safety, versatility
  { segment: "suv", patterns: /family|safe|space|room|versatil/i, adjustment: +8, reason: "Family and safety messaging aligns with SUV buyer priorities" },
  { segment: "suv", patterns: /adventure|explore|journey|road trip/i, adjustment: +6, reason: "Lifestyle aspiration language resonates with SUV shoppers" },

  // Sedan: value-focused, efficiency, commuter
  { segment: "sedan", patterns: /mpg|fuel|efficient|save/i, adjustment: +8, reason: "Efficiency and savings messaging resonates with sedan buyers" },
  { segment: "sedan", patterns: /lease|payment|monthly|afford/i, adjustment: +6, reason: "Budget-conscious framing aligns with sedan market" },

  // Luxury: exclusivity, experience, craftsmanship
  { segment: "luxury", patterns: /exclusive|private|bespoke|personal|curate/i, adjustment: +12, reason: "Exclusivity framing is essential for luxury positioning" },
  { segment: "luxury", patterns: /experience|discover|artisan|craft/i, adjustment: +8, reason: "Experiential and craftsmanship language elevates luxury perception" },
  { segment: "luxury", patterns: /deal|discount|cheap|bargain/i, adjustment: -10, reason: "Discount language undermines luxury brand positioning" },

  // EV: innovation, incentives, sustainability
  { segment: "ev", patterns: /credit|qualify|\$7,500|incentive|tax/i, adjustment: +12, reason: "EV tax credit is the #1 driver of EV consideration" },
  { segment: "ev", patterns: /range|charge|mile/i, adjustment: +8, reason: "Range and charging address primary EV adoption concern" },
  { segment: "ev", patterns: /innovat|future|next gen|advanced/i, adjustment: +6, reason: "Innovation positioning aligns with early EV adopter mindset" },

  // Sports: performance, emotion, exclusivity
  { segment: "sports", patterns: /performance|power|speed|hp|torque|0-60/i, adjustment: +12, reason: "Performance metrics are the primary sports car CTA hook" },
  { segment: "sports", patterns: /watch|reveal|experience|feel/i, adjustment: +8, reason: "Experiential and visual content drives sports car engagement" },
  { segment: "sports", patterns: /practical|efficient|save/i, adjustment: -6, reason: "Practical messaging contradicts sports car purchase psychology" },

  // Minivan: family, convenience, value
  { segment: "minivan", patterns: /family|kid|room|space|convenient/i, adjustment: +10, reason: "Family-centric language is core to minivan marketing" },
  { segment: "minivan", patterns: /entertain|connect|feature/i, adjustment: +6, reason: "In-vehicle features and entertainment resonate with family buyers" },
]

// ─── Apply Modifiers ────────────────────────────────────────

export function applyModifiers(
  baseScore: number,
  ctx: CTAEvaluationContext
): { adjustedScore: number; modifiers: AppliedModifier[] } {
  const modifiers: AppliedModifier[] = []
  let totalAdjustment = 0

  // Apply seasonal modifiers
  if (ctx.season) {
    for (const rule of SEASONAL_RULES) {
      if (rule.season === ctx.season && rule.patterns.test(ctx.cta)) {
        modifiers.push({
          type: "seasonal",
          name: `${rule.season} ${rule.adjustment > 0 ? "boost" : "penalty"}`,
          adjustment: rule.adjustment,
          reason: rule.reason,
        })
        totalAdjustment += rule.adjustment
      }
    }
  }

  // Apply demographic modifiers
  if (ctx.demographic) {
    for (const rule of DEMOGRAPHIC_RULES) {
      if (rule.demographic === ctx.demographic && rule.patterns.test(ctx.cta)) {
        modifiers.push({
          type: "demographic",
          name: `${rule.demographic} ${rule.adjustment > 0 ? "boost" : "penalty"}`,
          adjustment: rule.adjustment,
          reason: rule.reason,
        })
        totalAdjustment += rule.adjustment
      }
    }
  }

  // Apply segment modifiers
  if (ctx.vehicleSegment) {
    for (const rule of SEGMENT_RULES) {
      if (rule.segment === ctx.vehicleSegment && rule.patterns.test(ctx.cta)) {
        modifiers.push({
          type: "segment",
          name: `${rule.segment} ${rule.adjustment > 0 ? "boost" : "penalty"}`,
          adjustment: rule.adjustment,
          reason: rule.reason,
        })
        totalAdjustment += rule.adjustment
      }
    }
  }

  // Cap total modifier impact at ±25 points
  const cappedAdjustment = Math.max(-25, Math.min(25, totalAdjustment))
  const adjustedScore = Math.max(0, Math.min(100, baseScore + cappedAdjustment))

  return { adjustedScore, modifiers }
}
