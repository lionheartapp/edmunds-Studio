// lib/social.ts — Meta Marketing API + TikTok API Clients

import { Platform, ScheduleSlot } from "./types"

// ─── Meta (Facebook + Instagram) ─────────────────────────────

export async function publishToMeta(
  slot: ScheduleSlot,
  imageUrl: string,
  accessToken: string
): Promise<{ postId: string; permalink: string }> {
  // TODO: Implement Meta Marketing API
  // POST to /{page-id}/photos or /{ig-user-id}/media
  console.log(`[Meta] Publishing to ${slot.platform} at ${slot.scheduledAt}`)

  return {
    postId: `meta_${Date.now()}`,
    permalink: `https://facebook.com/post/${Date.now()}`,
  }
}

export async function scheduleMetaPost(
  slot: ScheduleSlot,
  imageUrl: string,
  accessToken: string
): Promise<{ scheduledPostId: string }> {
  // TODO: Use Meta's scheduled publishing endpoint
  console.log(`[Meta] Scheduling for ${slot.scheduledAt}`)

  return {
    scheduledPostId: `meta_scheduled_${Date.now()}`,
  }
}

// ─── TikTok ──────────────────────────────────────────────────

export async function publishToTikTok(
  slot: ScheduleSlot,
  videoUrl: string,
  accessToken: string
): Promise<{ publishId: string }> {
  // TODO: Implement TikTok Content Posting API
  console.log(`[TikTok] Publishing at ${slot.scheduledAt}`)

  return {
    publishId: `tiktok_${Date.now()}`,
  }
}

// ─── Unified Publisher ───────────────────────────────────────

export async function publishToAllPlatforms(
  slots: ScheduleSlot[],
  assets: Record<Platform, string>, // platform → asset URL
  tokens: { meta?: string; tiktok?: string }
): Promise<{ results: Array<{ platform: Platform; success: boolean; id?: string; error?: string }> }> {
  const results = await Promise.allSettled(
    slots.map(async (slot) => {
      const assetUrl = assets[slot.platform]
      if (!assetUrl) throw new Error(`No asset for platform ${slot.platform}`)

      if (
        slot.platform.startsWith("instagram") ||
        slot.platform.startsWith("facebook")
      ) {
        if (!tokens.meta) throw new Error("Meta access token required")
        const result = await publishToMeta(slot, assetUrl, tokens.meta)
        return { platform: slot.platform, success: true, id: result.postId }
      }

      if (slot.platform === "tiktok") {
        if (!tokens.tiktok) throw new Error("TikTok access token required")
        const result = await publishToTikTok(slot, assetUrl, tokens.tiktok)
        return { platform: slot.platform, success: true, id: result.publishId }
      }

      return { platform: slot.platform, success: false, error: "Unsupported platform" }
    })
  )

  return {
    results: results.map((r, i) =>
      r.status === "fulfilled"
        ? r.value
        : { platform: slots[i].platform, success: false, error: String(r.reason) }
    ),
  }
}
