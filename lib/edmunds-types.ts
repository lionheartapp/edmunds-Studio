// lib/edmunds-types.ts — Edmunds Data Types
// These types mirror the Edmunds internal API response shapes.
// When real API access is available, swap the mock implementation in edmunds.ts.

// ─── Vehicle & Inventory ────────────────────────────────────

export interface EdmundsVehicle {
  styleId: string
  year: number
  make: string
  model: string
  trim: string
  bodyType: string // "SUV", "Sedan", "Truck", etc.
  drivetrain: string // "AWD", "FWD", "RWD", "4WD"
  engine: string // "2.0L Turbo I4", "Electric", etc.
  mpg?: { city: number; highway: number; combined: number }
  range?: number // EV range in miles
  msrp: number
  invoice: number
  imageUrl: string
  colors: string[]
}

export interface EdmundsInventoryItem {
  vin: string
  vehicle: EdmundsVehicle
  dealerId: string
  dealerName: string
  dealerCity: string
  dealerState: string
  dealerZip: string
  sellingPrice: number
  daysOnLot: number
  mileage: number
  condition: "new" | "used" | "certified"
  imageUrls: string[]
  features: string[]
  distance?: number // miles from search zip
}

export interface EdmundsInventorySummary {
  make: string
  model: string
  totalInStock: number
  avgDaysOnLot: number
  avgSellingPrice: number
  avgMsrp: number
  priceRange: { min: number; max: number }
  ageDistribution: {
    under30Days: number
    thirtyTo60Days: number
    sixtyTo90Days: number
    over90Days: number
  }
  topTrims: { trim: string; count: number; avgPrice: number }[]
}

// ─── Pricing & TMV ─────────────────────────────────────────

export interface EdmundsTMV {
  styleId: string
  make: string
  model: string
  year: number
  trim: string
  zip: string
  msrp: number
  tmv: number // True Market Value
  tmvSavings: number // msrp - tmv
  invoice: number
  dealerCash: number
  priceRange: { low: number; high: number }
  nationalBasePrice: number
}

// ─── Incentives ─────────────────────────────────────────────

export interface EdmundsIncentive {
  id: string
  type: "cash_back" | "low_apr" | "lease_special" | "bonus_cash" | "loyalty" | "military" | "college_grad"
  name: string
  description: string
  amount?: number // dollar amount for cash incentives
  apr?: number // APR for financing incentives
  term?: number // months
  monthlyPayment?: number // for lease specials
  restrictions?: string
  startDate: string
  endDate: string
  make: string
  models: string[] // applicable models
  region: string
}

// ─── Editorial & Reviews ────────────────────────────────────

export interface EdmundsReview {
  vehicleId: string
  make: string
  model: string
  year: number
  expertRating: number // 1-10 scale
  consumerRating: number // 1-5 scale
  reviewCount: number
  pros: string[]
  cons: string[]
  editorSummary: string
  categories: {
    driving: number
    comfort: number
    interior: number
    technology: number
    storage: number
    value: number
  }
  sentiment: "very_positive" | "positive" | "mixed" | "negative"
}

// ─── Ad Placement ───────────────────────────────────────────

export type EdmundsAdFormat =
  | "display_banner"
  | "sponsored_listing"
  | "native_content"
  | "video_preroll"

export interface EdmundsAdPlacement {
  id: string
  format: EdmundsAdFormat
  name: string
  description: string
  dimensions: { width: number; height: number } | null // null for native/responsive
  locations: string[] // where on edmunds.com it appears
  estimatedImpressions: { min: number; max: number } // monthly
  cpmRange: { min: number; max: number } // cost per 1000 impressions
  targetingOptions: string[]
}

export interface EdmundsAdCampaign {
  id: string
  name: string
  status: "draft" | "pending_review" | "approved" | "live" | "paused" | "completed"
  format: EdmundsAdFormat
  creative: {
    headline: string
    bodyText: string
    cta: string
    imageUrl?: string
    videoUrl?: string
    destinationUrl: string
  }
  targeting: EdmundsAdTargeting
  budget: {
    dailyBudget: number
    totalBudget: number
    bidStrategy: "cpm" | "cpc" | "cpa"
    bidAmount: number
  }
  schedule: {
    startDate: string
    endDate: string
  }
  performance?: EdmundsAdPerformance
}

export interface EdmundsAdTargeting {
  makes?: string[]
  models?: string[]
  bodyTypes?: string[]
  priceRange?: { min: number; max: number }
  zipCodes?: string[]
  radius?: number // miles
  funnelStage?: ("researching" | "comparing" | "ready_to_buy")[]
  demographics?: {
    ageRange?: { min: number; max: number }
    income?: string // "50k-75k", "75k-100k", etc.
  }
  pages?: ("vehicle_page" | "review_page" | "comparison_page" | "inventory_page" | "homepage")[]
}

export interface EdmundsAdPerformance {
  impressions: number
  clicks: number
  ctr: number
  conversions: number
  conversionRate: number
  spend: number
  cpm: number
  cpc: number
  roas: number
  viewability: number
  topPerformingPage: string
  topPerformingZip: string
}

// ─── Market Intelligence ────────────────────────────────────

export interface EdmundsMarketData {
  make: string
  model: string
  region: string
  marketShare: number // percentage
  salesTrend: "rising" | "stable" | "declining"
  avgTransactionPrice: number
  incentiveSpend: number // avg per vehicle
  daysToTurn: number // avg days to sell
  competitorComparison: {
    competitor: string
    theirMarketShare: number
    theirAvgPrice: number
    theirDaysToTurn: number
  }[]
  shopperInterest: {
    searchVolume: number // monthly searches on edmunds
    trend: "up" | "flat" | "down"
    topSearchTerms: string[]
  }
}
