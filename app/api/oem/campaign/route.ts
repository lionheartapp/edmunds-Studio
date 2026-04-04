// app/api/oem/campaign/route.ts — Save and retrieve OEM campaigns

import { NextResponse } from "next/server"
import { saveOemCampaign, getOemCampaign, updateCampaignStatus } from "@/lib/supabase-oem"

export const maxDuration = 15

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.brandName || !body.logoUrl || !body.headline || !body.cta || !body.bodyText) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!body.imageUrls || body.imageUrls.length === 0) {
      return NextResponse.json(
        { error: "At least one vehicle image is required" },
        { status: 400 }
      )
    }

    const result = await saveOemCampaign({
      brandName: body.brandName,
      logoUrl: body.logoUrl,
      imageUrls: body.imageUrls,
      videoUrl: body.videoUrl,
      headline: body.headline,
      cta: body.cta,
      bodyText: body.bodyText,
      primaryColor: body.primaryColor,
      secondaryColor: body.secondaryColor,
      accentColor: body.accentColor,
      ctaSuggestions: body.ctaSuggestions,
      optimizations: body.optimizations,
      competitorIntel: body.competitorIntel,
    })

    if (!result) {
      return NextResponse.json(
        { error: "Failed to save campaign — check Supabase configuration" },
        { status: 500 }
      )
    }

    // Update status to "shared" since we're generating a share link
    await updateCampaignStatus(result.id, "shared")

    const shareUrl = `${getBaseUrl(request)}/share/${result.id}`

    return NextResponse.json({
      campaignId: result.id,
      shareUrl,
    })
  } catch (err) {
    console.error("[api/oem/campaign] POST error:", err)
    return NextResponse.json(
      { error: "Failed to save campaign" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Missing campaign id" },
        { status: 400 }
      )
    }

    const campaign = await getOemCampaign(id)

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      )
    }

    // Check expiration
    if (new Date(campaign.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Campaign link has expired" },
        { status: 410 }
      )
    }

    return NextResponse.json(campaign)
  } catch (err) {
    console.error("[api/oem/campaign] GET error:", err)
    return NextResponse.json(
      { error: "Failed to load campaign" },
      { status: 500 }
    )
  }
}

function getBaseUrl(request: Request): string {
  const host = request.headers.get("host") || "localhost:3000"
  const protocol = host.includes("localhost") ? "http" : "https"
  return `${protocol}://${host}`
}
