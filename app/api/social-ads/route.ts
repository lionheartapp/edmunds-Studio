// app/api/social-ads/route.ts — Real social ad data from Meta Ad Library
// Returns active ads for a given brand from Facebook/Instagram

import { NextRequest, NextResponse } from "next/server"
import { searchMetaAds } from "@/lib/meta-ads"

export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const { brandName, country = "US", limit = 6 } = await request.json()

    if (!brandName) {
      return NextResponse.json({ error: "brandName is required" }, { status: 400 })
    }

    console.log(`[social-ads] Fetching ads for "${brandName}" (country=${country}, limit=${limit})`)
    const result = await searchMetaAds(brandName, { country, limit })

    console.log(`[social-ads] Found ${result.ads.length} ads for "${brandName}" (source=${result.source})`)

    return NextResponse.json({ socialAds: result })
  } catch (error) {
    console.error("[social-ads] Error:", error instanceof Error ? error.message : error)
    // Return empty but valid response — never block the UI
    return NextResponse.json({
      socialAds: {
        ads: [],
        totalCount: 0,
        source: "mock" as const,
      },
    })
  }
}
