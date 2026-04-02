// app/api/ad-screenshot/route.ts — Screenshot capture + caching for Meta Ad Library ads
// ═══════════════════════════════════════════════════════════════════════════════════════
// GET /api/ad-screenshot?adId=<id>&snapshotUrl=<url>
//
// 1. Check Supabase cache for fresh screenshot
// 2. If miss: launch headless Chromium, capture screenshot
// 3. Upload to Supabase Storage, return public URL
// ═══════════════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server"
import { screenshotAd } from "@/lib/screenshot"
import { getScreenshot, saveScreenshot, isSupabaseConfigured } from "@/lib/supabase-storage"

export const maxDuration = 60

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const adId = searchParams.get("adId")
  const snapshotUrl = searchParams.get("snapshotUrl")

  // ── Validate inputs ─────────────────────────────────────
  if (!adId || !snapshotUrl) {
    return NextResponse.json(
      { error: "Both adId and snapshotUrl query params are required" },
      { status: 400 }
    )
  }

  // Basic URL validation — only allow facebook.com snapshot URLs
  try {
    const parsed = new URL(snapshotUrl)
    if (!parsed.hostname.endsWith("facebook.com")) {
      return NextResponse.json(
        { error: "snapshotUrl must be a facebook.com URL" },
        { status: 400 }
      )
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid snapshotUrl" },
      { status: 400 }
    )
  }

  try {
    // ── Check cache ─────────────────────────────────────────
    if (isSupabaseConfigured()) {
      const cachedUrl = await getScreenshot(adId)
      if (cachedUrl) {
        console.log(`[ad-screenshot] Cache hit for adId=${adId}`)
        return NextResponse.json(
          { screenshotUrl: cachedUrl, cached: true },
          { headers: CACHE_HEADERS }
        )
      }
    }

    // ── Capture screenshot ──────────────────────────────────
    console.log(`[ad-screenshot] Capturing screenshot for adId=${adId}`)
    const buffer = await screenshotAd(snapshotUrl)

    // ── Upload to Supabase (if configured) ──────────────────
    let screenshotUrl: string | null = null

    if (isSupabaseConfigured()) {
      screenshotUrl = await saveScreenshot(adId, buffer)
    }

    if (screenshotUrl) {
      // Return cached URL for future requests
      return NextResponse.json(
        { screenshotUrl, cached: false },
        { headers: CACHE_HEADERS }
      )
    }

    // No Supabase — serve the image directly as a binary response
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": buffer.length.toString(),
        ...CACHE_HEADERS,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Screenshot capture failed"
    console.error(`[ad-screenshot] Error for adId=${adId}:`, message)

    return NextResponse.json(
      { screenshotUrl: null, error: message },
      { status: 500, headers: CACHE_HEADERS }
    )
  }
}
