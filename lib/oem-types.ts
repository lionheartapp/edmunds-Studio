// lib/oem-types.ts — OEM Campaign Upload Flow Types

// ─── Ad Format ──────────────────────────────────────────────

export type EdmundsAdFormat =
  | "mrec"
  | "spotlight"
  | "leaderboard"
  | "mobile_adhesion"
  | "adhesion"

export const AD_FORMAT_DIMENSIONS: Record<
  EdmundsAdFormat,
  { width: number; height: number; label: string }
> = {
  mrec: { width: 300, height: 250, label: "MREC" },
  spotlight: { width: 300, height: 90, label: "Spotlight" },
  leaderboard: { width: 728, height: 90, label: "Leaderboard" },
  mobile_adhesion: { width: 320, height: 50, label: "Mobile Adhesion" },
  adhesion: { width: 1200, height: 100, label: "Adhesion" },
}

// ─── OEM Assets & Copy ──────────────────────────────────────

export interface OemAssets {
  logoUrl: string
  imageUrls: string[]
  videoUrl?: string
}

export interface OemCopy {
  headline: string
  cta: string
  bodyText: string
  brandName: string
}

export interface BrandColors {
  primary: string
  secondary: string
  accent: string
}

// ─── CTA Intelligence ───────────────────────────────────────

export interface CtaSuggestion {
  cta: string
  score: number // 0-100
  reason: string
  category: "urgency" | "value" | "configurator" | "incentive" | "emotional" | "informational"
}

export interface OptimizationSet {
  demographic: Optimization[]
  regional: Optimization[]
  seasonal: Optimization[]
}

export interface Optimization {
  title: string
  description: string
  confidence: "high" | "medium" | "low"
  dataPoint?: string
}

// ─── Campaign & Approval ────────────────────────────────────

export type CampaignStatus = "draft" | "shared" | "approved" | "rejected"

export interface OemCampaign {
  id: string
  brandName: string
  assets: OemAssets
  copy: OemCopy
  brandColors?: BrandColors
  ctaSuggestions?: CtaSuggestion[]
  optimizations?: OptimizationSet
  competitorIntel?: CompetitorIntelData
  status: CampaignStatus
  comments: ApprovalComment[]
  approvedBy?: string
  approvedAt?: string
  createdAt: string
  updatedAt?: string
  expiresAt: string
}

export interface ApprovalComment {
  id: string
  campaignId: string
  authorName: string
  message: string
  createdAt: string
}

export interface CompetitorIntelData {
  competitors: CompetitorCtaEntry[]
  gaps: string[]
}

export interface CompetitorCtaEntry {
  brand: string
  cta: string
  score: number
  format: string
}

// ─── API Request/Response ───────────────────────────────────

export interface CtaScoreRequest {
  cta: string
  brandName: string
  vehicleSegment?: string
  season?: string
  demographic?: string
  competitorCTAs?: string[]
}

export interface CtaScoreResponse {
  score: number
  strengths: string[]
  weaknesses: string[]
  suggestions: CtaSuggestion[]
  competitorBenchmark?: {
    averageScore: number
    bestCta: string
    bestScore: number
  }
}

export interface OptimizeRequest {
  brandName: string
  copy: OemCopy
  vehicleSegment?: string
}

export interface OptimizeResponse {
  demographic: Optimization[]
  regional: Optimization[]
  seasonal: Optimization[]
}

export interface UploadResponse {
  url: string
  fileId: string
  type: "logo" | "image" | "video"
}

export interface SaveCampaignResponse {
  campaignId: string
  shareUrl: string
}
