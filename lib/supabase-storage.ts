// lib/supabase-storage.ts — Supabase Storage cache for ad screenshots
// ═══════════════════════════════════════════════════════════════════════
// Caches JPEG screenshots in a public "ad-screenshots" bucket.
// Each file is keyed by ad ID and considered fresh for 24 hours.
// ═══════════════════════════════════════════════════════════════════════

import { createClient } from "@supabase/supabase-js"

const BUCKET_NAME = "ad-screenshots"
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY

  if (!url || !key) {
    return null
  }

  return createClient(url, key)
}

export function isSupabaseConfigured(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
}

/**
 * Check if a cached screenshot exists and is fresh (< 24h old).
 * Returns the public URL if cached, or null if expired/missing.
 */
export async function getScreenshot(adId: string): Promise<string | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const filePath = `${adId}.jpg`

  try {
    // List files to check metadata (updated_at timestamp)
    const { data: files, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list("", { search: filePath, limit: 1 })

    if (error || !files || files.length === 0) {
      return null
    }

    const file = files[0]
    if (file.name !== filePath) return null

    // Check freshness
    const updatedAt = new Date(file.updated_at ?? Date.now()).getTime()
    const age = Date.now() - updatedAt
    if (age > CACHE_TTL_MS) {
      return null // Stale — needs re-capture
    }

    // Return public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    return urlData.publicUrl
  } catch (err) {
    console.error("[supabase-storage] getScreenshot error:", err)
    return null
  }
}

/**
 * Upload a JPEG screenshot buffer to Supabase Storage.
 * Returns the public URL of the uploaded file.
 */
export async function saveScreenshot(adId: string, buffer: Buffer): Promise<string | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const filePath = `${adId}.jpg`

  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: "image/jpeg",
        upsert: true, // Overwrite stale cache
      })

    if (error) {
      console.error("[supabase-storage] Upload error:", error.message)
      return null
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    return urlData.publicUrl
  } catch (err) {
    console.error("[supabase-storage] saveScreenshot error:", err)
    return null
  }
}
