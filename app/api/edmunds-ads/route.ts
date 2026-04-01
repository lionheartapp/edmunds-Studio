// app/api/edmunds-ads/route.ts — Real Edmunds Ad Activity from Databricks
// Returns actual campaign data + vehicle image URLs for a given make

import { NextRequest, NextResponse } from "next/server"
import {
  isDatabricksConfigured,
  queryEdmundsAdActivity,
  getEdmundsVehicleImages,
} from "@/lib/databricks"

export const maxDuration = 45

export async function POST(request: NextRequest) {
  try {
    const { make } = await request.json()

    if (!make) {
      return NextResponse.json({ error: "Make is required" }, { status: 400 })
    }

    if (!isDatabricksConfigured()) {
      // Return mock data so the UI always has something to show
      console.log("[edmunds-ads] Databricks not configured, returning mock data")
      return NextResponse.json({ edmundsAds: buildMockData(make) })
    }

    const activity = await queryEdmundsAdActivity(make)

    if (!activity) {
      console.log(`[edmunds-ads] No activity found for ${make}, returning mock`)
      return NextResponse.json({ edmundsAds: buildMockData(make) })
    }

    // Enrich event summary with vehicle images
    const enrichedEvents = activity.eventSummary.map((event) => ({
      ...event,
      vehicleImages: event.targetedModel
        ? getEdmundsVehicleImages(
            make,
            event.targetedModel,
            event.targetedModelYear || new Date().getFullYear().toString()
          )
        : [],
    }))

    return NextResponse.json({
      edmundsAds: {
        campaigns: activity.campaigns,
        models: enrichedEvents,
        totalImpressions: activity.totalImpressions,
        totalSpend: activity.totalSpend,
        totalCreatives: activity.totalCreatives,
        activeCampaigns: activity.activeCampaigns,
        source: "databricks" as const,
      },
    })
  } catch (error) {
    console.error("[edmunds-ads] Error:", error instanceof Error ? error.message : error)
    // Always return something — never block the UI
    try {
      const { make } = await request.clone().json()
      return NextResponse.json({ edmundsAds: buildMockData(make || "Brand") })
    } catch {
      return NextResponse.json({ edmundsAds: buildMockData("Brand") })
    }
  }
}

function buildMockData(make: string) {
  const currentYear = new Date().getFullYear()
  const models = getTopModels(make)

  return {
    campaigns: [
      {
        campaignName: `${make} Spring Sales Event`,
        dealerName: `${make} National`,
        strategy: "Conquest + Retargeting",
        impressions: 1250000,
        clicks: 18750,
        ctr: 1.5,
        spend: 45000,
        cpm: 36,
        cpc: 2.4,
        contacts: 312,
      },
      {
        campaignName: `${make} Model Spotlight`,
        dealerName: `${make} Tier 1`,
        strategy: "In-Market Shoppers",
        impressions: 890000,
        clicks: 12460,
        ctr: 1.4,
        spend: 32000,
        cpm: 35.96,
        cpc: 2.57,
        contacts: 198,
      },
    ],
    models: models.map((model) => ({
      targetedModel: model,
      targetedModelYear: currentYear.toString(),
      totalImpressions: Math.floor(Math.random() * 500000) + 200000,
      totalClicks: Math.floor(Math.random() * 8000) + 2000,
      totalRevenue: Math.floor(Math.random() * 50000) + 15000,
      viewabilityPct: Math.floor(Math.random() * 15) + 70,
      uniqueCreatives: Math.floor(Math.random() * 10) + 3,
      topStates: ["CA", "TX", "FL", "NY", "IL"],
      vehicleImages: getEdmundsVehicleImages(make, model, currentYear),
    })),
    totalImpressions: 2140000,
    totalSpend: 77000,
    totalCreatives: 24,
    activeCampaigns: 2,
    source: "mock" as const,
  }
}

function getTopModels(make: string): string[] {
  const knownModels: Record<string, string[]> = {
    ford: ["F-150", "Explorer", "Mustang"],
    toyota: ["Camry", "RAV4", "Highlander"],
    honda: ["Civic", "CR-V", "Accord"],
    chevrolet: ["Silverado", "Equinox", "Tahoe"],
    rivian: ["R1T", "R1S", "R2"],
    subaru: ["Outback", "Forester", "Crosstrek"],
    bmw: ["3 Series", "X5", "X3"],
    tesla: ["Model Y", "Model 3", "Model X"],
    hyundai: ["Tucson", "Palisade", "Ioniq 5"],
    kia: ["Telluride", "Sportage", "EV6"],
    jeep: ["Grand Cherokee", "Wrangler", "Compass"],
    nissan: ["Rogue", "Altima", "Pathfinder"],
    mercedes: ["C-Class", "GLE", "GLC"],
    audi: ["Q5", "A4", "Q7"],
    volkswagen: ["Tiguan", "Atlas", "Jetta"],
    mazda: ["CX-5", "CX-50", "Mazda3"],
    lexus: ["RX", "NX", "ES"],
    gmc: ["Sierra", "Yukon", "Terrain"],
    ram: ["1500", "2500", "3500"],
    dodge: ["Durango", "Charger", "Hornet"],
  }

  const key = make.toLowerCase().replace(/[^a-z]/g, "")
  return knownModels[key] || ["Model A", "Model B", "Model C"]
}
