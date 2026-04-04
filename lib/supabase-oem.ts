// lib/supabase-oem.ts — Supabase operations for OEM campaign flow
// Follows the graceful-degradation pattern from supabase-storage.ts

import { createClient, SupabaseClient } from "@supabase/supabase-js"
import type {
  OemCampaign,
  ApprovalComment,
  CampaignStatus,
} from "./oem-types"

const BUCKET_NAME = "oem-assets"

function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY

  if (!url || !key) return null

  return createClient(url, key)
}

// ─── Asset Upload ───────────────────────────────────────────

export async function uploadOemAsset(
  file: Buffer,
  path: string,
  contentType: string
): Promise<string | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, { contentType, upsert: true })

    if (error) {
      console.error("[supabase-oem] Upload error:", error.message)
      return null
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path)

    return urlData.publicUrl
  } catch (err) {
    console.error("[supabase-oem] uploadOemAsset error:", err)
    return null
  }
}

// ─── Campaign CRUD ──────────────────────────────────────────

export async function saveOemCampaign(campaign: {
  brandName: string
  logoUrl: string
  imageUrls: string[]
  videoUrl?: string
  headline: string
  cta: string
  bodyText: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  ctaSuggestions?: unknown
  optimizations?: unknown
  competitorIntel?: unknown
}): Promise<{ id: string } | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from("oem_campaigns")
      .insert({
        brand_name: campaign.brandName,
        logo_url: campaign.logoUrl,
        image_urls: campaign.imageUrls,
        video_url: campaign.videoUrl ?? null,
        headline: campaign.headline,
        cta: campaign.cta,
        body_text: campaign.bodyText,
        primary_color: campaign.primaryColor ?? null,
        secondary_color: campaign.secondaryColor ?? null,
        accent_color: campaign.accentColor ?? null,
        cta_suggestions: campaign.ctaSuggestions ?? null,
        optimizations: campaign.optimizations ?? null,
        competitor_intel: campaign.competitorIntel ?? null,
        status: "draft",
      })
      .select("id")
      .single()

    if (error) {
      console.error("[supabase-oem] saveOemCampaign error:", error.message)
      return null
    }

    return { id: data.id }
  } catch (err) {
    console.error("[supabase-oem] saveOemCampaign error:", err)
    return null
  }
}

export async function getOemCampaign(id: string): Promise<OemCampaign | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from("oem_campaigns")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) {
      console.error("[supabase-oem] getOemCampaign error:", error?.message)
      return null
    }

    // Map DB row to OemCampaign shape
    return {
      id: data.id,
      brandName: data.brand_name,
      assets: {
        logoUrl: data.logo_url,
        imageUrls: data.image_urls,
        videoUrl: data.video_url ?? undefined,
      },
      copy: {
        headline: data.headline,
        cta: data.cta,
        bodyText: data.body_text,
        brandName: data.brand_name,
      },
      brandColors: data.primary_color
        ? {
            primary: data.primary_color,
            secondary: data.secondary_color ?? data.primary_color,
            accent: data.accent_color ?? data.primary_color,
          }
        : undefined,
      ctaSuggestions: data.cta_suggestions ?? undefined,
      optimizations: data.optimizations ?? undefined,
      competitorIntel: data.competitor_intel ?? undefined,
      status: data.status as CampaignStatus,
      comments: [],
      approvedBy: data.approved_by ?? undefined,
      approvedAt: data.approved_at ?? undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at ?? undefined,
      expiresAt: data.expires_at,
    }
  } catch (err) {
    console.error("[supabase-oem] getOemCampaign error:", err)
    return null
  }
}

export async function updateCampaignStatus(
  id: string,
  status: CampaignStatus
): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  try {
    const { error } = await supabase
      .from("oem_campaigns")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) {
      console.error("[supabase-oem] updateCampaignStatus error:", error.message)
      return false
    }
    return true
  } catch (err) {
    console.error("[supabase-oem] updateCampaignStatus error:", err)
    return false
  }
}

// ─── Comments ───────────────────────────────────────────────

export async function addComment(
  campaignId: string,
  authorName: string,
  message: string
): Promise<ApprovalComment | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from("oem_comments")
      .insert({
        campaign_id: campaignId,
        author_name: authorName,
        message,
      })
      .select("*")
      .single()

    if (error || !data) {
      console.error("[supabase-oem] addComment error:", error?.message)
      return null
    }

    return {
      id: data.id,
      campaignId: data.campaign_id,
      authorName: data.author_name,
      message: data.message,
      createdAt: data.created_at,
    }
  } catch (err) {
    console.error("[supabase-oem] addComment error:", err)
    return null
  }
}

export async function getComments(campaignId: string): Promise<ApprovalComment[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  try {
    const { data, error } = await supabase
      .from("oem_comments")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: true })

    if (error || !data) {
      console.error("[supabase-oem] getComments error:", error?.message)
      return []
    }

    return data.map((row) => ({
      id: row.id,
      campaignId: row.campaign_id,
      authorName: row.author_name,
      message: row.message,
      createdAt: row.created_at,
    }))
  } catch (err) {
    console.error("[supabase-oem] getComments error:", err)
    return []
  }
}

// ─── Approval ───────────────────────────────────────────────

export async function approveCampaign(
  id: string,
  approverName: string
): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  try {
    const { error } = await supabase
      .from("oem_campaigns")
      .update({
        status: "approved",
        approved_by: approverName,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error("[supabase-oem] approveCampaign error:", error.message)
      return false
    }
    return true
  } catch (err) {
    console.error("[supabase-oem] approveCampaign error:", err)
    return false
  }
}
