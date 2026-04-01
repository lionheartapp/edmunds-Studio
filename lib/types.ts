// lib/types.ts — Edmunds Studio Core Type Definitions

// ─── Brand DNA ───────────────────────────────────────────────

export interface BrandDNA {
  name: string
  domain: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  typography: {
    primaryFont: string
    fallback: string
    headingWeight: string
  }
  voice: string[] // e.g. ["Bold", "Adventurous", "Premium"]
  visualStyle: string[] // e.g. ["Cinematic", "Outdoor", "Golden hour"]
  currentAds: AdSample[]
  competitors: string[]
  competitorProfiles?: CompetitorProfile[]
  guidelinesUrl?: string
}

export interface AdSample {
  platform: string
  headline: string
  cta: string
  imageUrl?: string
  format: string
  dateSpotted?: string
  bodyText?: string
  thumbnailDesc?: string // AI-generated description of the ad visual
  engagementRate?: number
  estimatedSpend?: string
}

// ─── Competitor Intelligence ────────────────────────────────

export interface CompetitorProfile {
  name: string
  domain: string
  logoColor: string // hex color for the avatar placeholder
  adSpend: string // e.g. "$50k-100k/mo"
  topPlatform: string
  audienceOverlap: number // 0-100%
  ads: CompetitorAd[]
  strengths: string[]
  weaknesses: string[]
}

export interface CompetitorAd {
  platform: string
  headline: string
  bodyText: string
  cta: string
  format: string // "Image", "Video", "Carousel"
  thumbnailDesc: string // description of the ad visual for mockup rendering
  dateSpotted: string
  estimatedImpressions: string
  engagementRate: number
  sentiment: "positive" | "neutral" | "negative"
  whyItWorks?: string
}

// ─── Strategic Edge ─────────────────────────────────────────

export interface StrategicEdge {
  opportunities: Opportunity[]
  overallStrategy: string
  quickWins: string[]
  preBuiltCampaigns: PreBuiltCampaign[]
}

export interface Opportunity {
  id: string
  title: string
  category: "audience_gap" | "format_gap" | "platform_gap" | "messaging_gap" | "timing_gap" | "creative_gap"
  impact: "high" | "medium" | "low"
  insight: string
  suggestedAngle: string
  suggestedPlatforms: string[]
  estimatedEdge: string
}

export interface PreBuiltCampaign {
  id: string
  name: string
  opportunityId: string
  angle: string
  headline: string
  bodyText: string
  cta: string
  platform: string
  format: string
  thumbnailDesc: string
  tone: string
  targetAudience: string
  estimatedImpact: string
}

// ─── Creative Brief ──────────────────────────────────────────

export interface CreativeBrief {
  brand: string
  product: string
  tagline: string
  headline: string
  subheadline: string
  cta: string
  voiceoverScript: string
  imagePrompt: string
  colorPalette: string[]
  visualStyle: string
  motionStyle: string
  tone: string
  durationSeconds: number
  platforms: Platform[]
  legalDisclaimer?: string
  inventoryData?: DealerInventory
}

export type Platform =
  | "instagram_feed" // 1080x1080
  | "instagram_story" // 1080x1920
  | "tiktok" // 1080x1920
  | "facebook_feed" // 1200x628
  | "facebook_story" // 1080x1920
  | "youtube_preroll" // 1920x1080

export const PLATFORM_DIMENSIONS: Record<Platform, { width: number; height: number; label: string }> = {
  instagram_feed: { width: 1080, height: 1080, label: "Instagram Feed" },
  instagram_story: { width: 1080, height: 1920, label: "Instagram Story" },
  tiktok: { width: 1080, height: 1920, label: "TikTok" },
  facebook_feed: { width: 1200, height: 628, label: "Facebook Feed" },
  facebook_story: { width: 1080, height: 1920, label: "Facebook Story" },
  youtube_preroll: { width: 1920, height: 1080, label: "YouTube Pre-roll" },
}

// ─── Campaign Output ─────────────────────────────────────────

export interface CampaignOutput {
  brief: CreativeBrief
  heroImage: string // URL from Imagen
  figmaFileUrl: string // Shareable Figma link
  aeScriptPath: string // .jsx download
  voiceoverUrl: string // MP3 URL
  variants: CampaignVariant[]
}

export interface CampaignVariant {
  id: string
  angle: "emotional" | "rational" | "urgency"
  headline: string
  description: string
  assets: CampaignOutput
}

// ─── Dealer / Inventory ──────────────────────────────────────

export interface DealerInventory {
  dealerName: string
  dealerId: string
  location: {
    city: string
    state: string
    zip: string
  }
  vehicles: InventoryVehicle[]
  incentives: Incentive[]
}

export interface InventoryVehicle {
  year: number
  make: string
  model: string
  trim: string
  msrp: number
  sellingPrice: number
  inStock: number
  imageUrl?: string
  vin?: string
}

export interface Incentive {
  type: "cashBack" | "apr" | "lease" | "bonus"
  description: string
  amount?: number
  apr?: number
  term?: number
  expiresAt: string
}

// ─── Pipeline ────────────────────────────────────────────────

export type PipelineStage =
  | "brand_dna"
  | "creative_brief"
  | "image_generation"
  | "figma_generation"
  | "ae_script"
  | "voiceover"
  | "variant_generation"
  | "complete"

export interface PipelineStatus {
  stage: PipelineStage
  status: "pending" | "running" | "complete" | "error"
  message?: string
  progress?: number // 0-100
  output?: unknown
}

export interface PipelineRun {
  id: string
  brandDna: BrandDNA
  brief: CreativeBrief
  stages: PipelineStatus[]
  startedAt: string
  completedAt?: string
  output?: CampaignOutput
}

// ─── Social Publishing ───────────────────────────────────────

export interface ScheduleSlot {
  platform: Platform
  variantId: string
  scheduledAt: string // ISO datetime
  caption: string
  hashtags: string[]
  status: "draft" | "scheduled" | "published" | "failed"
}

export interface CampaignPerformance {
  campaignId: string
  platform: Platform
  impressions: number
  clicks: number
  ctr: number
  engagement: number
  spend: number
  conversions: number
  roas: number
  topVariant: string
  insightSummary: string
}
