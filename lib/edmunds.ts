// lib/edmunds.ts — Edmunds Data Service
// ═══════════════════════════════════════════════════════════════
// Clean interface layer for Edmunds APIs.
// Currently uses mock data for hackathon demo.
// To switch to real APIs: replace the mock functions below
// with actual fetch calls to internal Edmunds endpoints.
// The interface stays the same — no UI changes needed.
// ═══════════════════════════════════════════════════════════════

import {
  EdmundsVehicle,
  EdmundsInventorySummary,
  EdmundsTMV,
  EdmundsIncentive,
  EdmundsReview,
  EdmundsAdPlacement,
  EdmundsAdFormat,
  EdmundsMarketData,
  EdmundsInventoryItem,
} from "./edmunds-types"

// ─── Configuration ──────────────────────────────────────────
// When real API access is available, set these env vars:
// EDMUNDS_API_KEY, EDMUNDS_API_BASE_URL, EDMUNDS_INTERNAL_TOKEN

const API_BASE = process.env.EDMUNDS_API_BASE_URL || "https://api.edmunds.com"
const API_KEY = process.env.EDMUNDS_API_KEY || ""
const INTERNAL_TOKEN = process.env.EDMUNDS_INTERNAL_TOKEN || ""
const USE_MOCK = !API_KEY && !INTERNAL_TOKEN

// ─── Public Interface ───────────────────────────────────────

export async function getInventorySummary(
  make: string,
  model?: string,
  zip?: string
): Promise<EdmundsInventorySummary> {
  if (USE_MOCK) return mockInventorySummary(make, model)
  // TODO: Real API call
  // const res = await fetch(`${API_BASE}/api/inventory/v2/summary?make=${make}&model=${model}&zip=${zip}&api_key=${API_KEY}`)
  return mockInventorySummary(make, model)
}

export async function getInventoryItems(
  make: string,
  model?: string,
  zip?: string,
  radius?: number
): Promise<EdmundsInventoryItem[]> {
  if (USE_MOCK) return mockInventoryItems(make, model)
  return mockInventoryItems(make, model)
}

export async function getTMVPricing(
  make: string,
  model: string,
  year: number,
  zip: string
): Promise<EdmundsTMV> {
  if (USE_MOCK) return mockTMV(make, model, year, zip)
  // TODO: Real API call
  // const res = await fetch(`${API_BASE}/v1/api/tmv/tmvservice/calculatenewtmv?make=${make}&model=${model}&year=${year}&zip=${zip}&fmt=json&api_key=${API_KEY}`)
  return mockTMV(make, model, year, zip)
}

export async function getIncentives(
  make: string,
  zip: string,
  model?: string
): Promise<EdmundsIncentive[]> {
  if (USE_MOCK) return mockIncentives(make, model)
  // TODO: Real API call
  // const res = await fetch(`${API_BASE}/v1/api/incentive/incentiverepository/findincentivesbymakeid?makeid=${make}&zipcode=${zip}&fmt=json&api_key=${API_KEY}`)
  return mockIncentives(make, model)
}

export async function getReviews(
  make: string,
  model: string,
  year?: number
): Promise<EdmundsReview> {
  if (USE_MOCK) return mockReview(make, model, year)
  return mockReview(make, model, year)
}

export async function getMarketData(
  make: string,
  model?: string,
  region?: string
): Promise<EdmundsMarketData> {
  if (USE_MOCK) return mockMarketData(make, model)
  return mockMarketData(make, model)
}

export async function getAdPlacements(): Promise<EdmundsAdPlacement[]> {
  return EDMUNDS_AD_PLACEMENTS
}

export function isEdmundsConfigured(): boolean {
  return !!API_KEY || !!INTERNAL_TOKEN
}

// ─── Ad Placement Catalog ───────────────────────────────────

const EDMUNDS_AD_PLACEMENTS: EdmundsAdPlacement[] = [
  {
    id: "display_banner_728",
    format: "display_banner",
    name: "Leaderboard Banner",
    description: "High-visibility banner across vehicle pages, review pages, and comparison tools",
    dimensions: { width: 728, height: 90 },
    locations: ["Vehicle pages", "Review pages", "Comparison pages", "Search results"],
    estimatedImpressions: { min: 500000, max: 2000000 },
    cpmRange: { min: 8, max: 22 },
    targetingOptions: ["Make/Model", "Body type", "Price range", "Zip code", "Funnel stage"],
  },
  {
    id: "display_banner_300",
    format: "display_banner",
    name: "Medium Rectangle",
    description: "Sidebar display ad alongside editorial content and vehicle specs",
    dimensions: { width: 300, height: 250 },
    locations: ["Article sidebars", "Vehicle spec pages", "Dealer pages"],
    estimatedImpressions: { min: 300000, max: 1200000 },
    cpmRange: { min: 6, max: 18 },
    targetingOptions: ["Make/Model", "Body type", "Price range", "Zip code"],
  },
  {
    id: "sponsored_listing",
    format: "sponsored_listing",
    name: "Sponsored Inventory Listing",
    description: "Promoted vehicle listing pinned to top of search results with 'Sponsored' badge",
    dimensions: null,
    locations: ["Inventory search results", "Model landing pages", "Dealer inventory pages"],
    estimatedImpressions: { min: 200000, max: 800000 },
    cpmRange: { min: 15, max: 35 },
    targetingOptions: ["Make/Model", "Zip code radius", "Price range", "New/Used", "Funnel stage"],
  },
  {
    id: "native_content",
    format: "native_content",
    name: "Native Content Feature",
    description: "Branded content card that appears alongside editorial — looks like an Edmunds article with 'Sponsored' label",
    dimensions: null,
    locations: ["Homepage feed", "Model research pages", "Editorial section", "Comparison pages"],
    estimatedImpressions: { min: 400000, max: 1500000 },
    cpmRange: { min: 20, max: 45 },
    targetingOptions: ["Make/Model", "Body type", "Shopper intent", "Demographics", "Zip code"],
  },
  {
    id: "video_preroll",
    format: "video_preroll",
    name: "Video Pre-Roll",
    description: "15-30 second video ad before Edmunds expert review videos and walkarounds",
    dimensions: { width: 1920, height: 1080 },
    locations: ["Expert review videos", "Vehicle walkaround videos", "Comparison videos"],
    estimatedImpressions: { min: 150000, max: 600000 },
    cpmRange: { min: 25, max: 55 },
    targetingOptions: ["Make/Model", "Body type", "Video category", "Zip code", "Funnel stage"],
  },
]

// ─── Mock Data Generators ───────────────────────────────────
// These produce realistic Edmunds-style data for the hackathon demo.
// Replace each function body with real API calls when ready.

function mockInventorySummary(make: string, model?: string): EdmundsInventorySummary {
  const configs: Record<string, Partial<EdmundsInventorySummary>> = {
    rivian: {
      make: "Rivian", model: "R1S",
      totalInStock: 847, avgDaysOnLot: 42, avgSellingPrice: 78400, avgMsrp: 82000,
      priceRange: { min: 73900, max: 98800 },
      ageDistribution: { under30Days: 312, thirtyTo60Days: 285, sixtyTo90Days: 168, over90Days: 82 },
      topTrims: [
        { trim: "Adventure", count: 340, avgPrice: 78400 },
        { trim: "Explore", count: 285, avgPrice: 73900 },
        { trim: "Launch Edition", count: 122, avgPrice: 92000 },
      ],
    },
    toyota: {
      make: "Toyota", model: model || "RAV4",
      totalInStock: 12450, avgDaysOnLot: 28, avgSellingPrice: 34200, avgMsrp: 35500,
      priceRange: { min: 29800, max: 42600 },
      ageDistribution: { under30Days: 5800, thirtyTo60Days: 3900, sixtyTo90Days: 1850, over90Days: 900 },
      topTrims: [
        { trim: "XLE", count: 4200, avgPrice: 33800 },
        { trim: "Limited", count: 3100, avgPrice: 38200 },
        { trim: "TRD Off-Road", count: 2400, avgPrice: 36500 },
      ],
    },
    subaru: {
      make: "Subaru", model: model || "Outback",
      totalInStock: 6280, avgDaysOnLot: 35, avgSellingPrice: 38700, avgMsrp: 39900,
      priceRange: { min: 33500, max: 45200 },
      ageDistribution: { under30Days: 2400, thirtyTo60Days: 2100, sixtyTo90Days: 1200, over90Days: 580 },
      topTrims: [
        { trim: "Limited", count: 2100, avgPrice: 39800 },
        { trim: "Onyx Edition XT", count: 1800, avgPrice: 41200 },
        { trim: "Premium", count: 1500, avgPrice: 35600 },
      ],
    },
    honda: {
      make: "Honda", model: model || "CR-V",
      totalInStock: 9800, avgDaysOnLot: 22, avgSellingPrice: 33100, avgMsrp: 34500,
      priceRange: { min: 29900, max: 41800 },
      ageDistribution: { under30Days: 4800, thirtyTo60Days: 3200, sixtyTo90Days: 1200, over90Days: 600 },
      topTrims: [
        { trim: "EX-L", count: 3200, avgPrice: 35200 },
        { trim: "Sport", count: 2800, avgPrice: 31500 },
        { trim: "Touring", count: 2100, avgPrice: 39800 },
      ],
    },
  }

  const key = make.toLowerCase().split(" ")[0]
  const data = configs[key] || configs.toyota

  return {
    make: data.make || make,
    model: data.model || model || "Unknown",
    totalInStock: data.totalInStock || 5000,
    avgDaysOnLot: data.avgDaysOnLot || 30,
    avgSellingPrice: data.avgSellingPrice || 35000,
    avgMsrp: data.avgMsrp || 37000,
    priceRange: data.priceRange || { min: 28000, max: 52000 },
    ageDistribution: data.ageDistribution || { under30Days: 2000, thirtyTo60Days: 1500, sixtyTo90Days: 1000, over90Days: 500 },
    topTrims: data.topTrims || [{ trim: "Base", count: 2000, avgPrice: 35000 }],
  }
}

function mockInventoryItems(make: string, model?: string): EdmundsInventoryItem[] {
  const summary = mockInventorySummary(make, model)
  return summary.topTrims.slice(0, 3).map((trim, i) => ({
    vin: `1FTEW1EP${i}NFA${10000 + i}`,
    vehicle: {
      styleId: `${make.toLowerCase()}_${(model || "model").toLowerCase()}_${trim.trim.toLowerCase().replace(/\s+/g, "_")}`,
      year: 2025,
      make: summary.make,
      model: summary.model,
      trim: trim.trim,
      bodyType: "SUV",
      drivetrain: "AWD",
      engine: "2.5L 4-Cyl",
      msrp: trim.avgPrice + 1500,
      invoice: trim.avgPrice - 800,
      imageUrl: "",
      colors: ["Pearl White", "Midnight Black", "Lunar Silver"],
    },
    dealerId: `dealer_${1000 + i}`,
    dealerName: `${summary.make} of Temecula`,
    dealerCity: "Temecula",
    dealerState: "CA",
    dealerZip: "92591",
    sellingPrice: trim.avgPrice,
    daysOnLot: 15 + i * 12,
    mileage: i === 0 ? 0 : 12500 + i * 5000,
    condition: i === 0 ? "new" : "certified",
    imageUrls: [],
    features: ["Sunroof", "Navigation", "Heated Seats", "Blind Spot Monitor"],
    distance: 5 + i * 3,
  }))
}

function mockTMV(make: string, model: string, year: number, zip: string): EdmundsTMV {
  const summary = mockInventorySummary(make, model)
  const msrp = summary.avgMsrp
  const tmv = Math.round(msrp * 0.96)

  return {
    styleId: `${make.toLowerCase()}_${model.toLowerCase()}_2025`,
    make: summary.make,
    model: summary.model,
    year,
    trim: summary.topTrims[0]?.trim || "Base",
    zip,
    msrp,
    tmv,
    tmvSavings: msrp - tmv,
    invoice: Math.round(msrp * 0.93),
    dealerCash: 750,
    priceRange: { low: Math.round(tmv * 0.97), high: Math.round(tmv * 1.03) },
    nationalBasePrice: Math.round(msrp * 0.95),
  }
}

function mockIncentives(make: string, model?: string): EdmundsIncentive[] {
  const configs: Record<string, EdmundsIncentive[]> = {
    rivian: [
      {
        id: "inc_riv_001", type: "cash_back", name: "Rivian Adventure Bonus",
        description: "$2,000 Adventure Package bonus cash on R1S", amount: 2000,
        startDate: "2025-10-01", endDate: "2025-12-31",
        make: "Rivian", models: ["R1S", "R1T"], region: "National",
      },
      {
        id: "inc_riv_002", type: "low_apr", name: "Rivian Finance Special",
        description: "1.9% APR for 60 months on all new Rivian models", apr: 1.9, term: 60,
        startDate: "2025-10-01", endDate: "2025-12-31",
        make: "Rivian", models: ["R1S", "R1T", "R2"], region: "National",
      },
    ],
    toyota: [
      {
        id: "inc_toy_001", type: "cash_back", name: "Toyota Fall Savings",
        description: "$3,000 customer cash on RAV4 and Camry", amount: 3000,
        startDate: "2025-10-01", endDate: "2025-12-31",
        make: "Toyota", models: ["RAV4", "Camry"], region: "National",
      },
      {
        id: "inc_toy_002", type: "low_apr", name: "Toyota Finance Event",
        description: "2.9% APR for 72 months on select models", apr: 2.9, term: 72,
        startDate: "2025-10-01", endDate: "2025-12-31",
        make: "Toyota", models: ["RAV4", "Camry", "Highlander"], region: "National",
      },
      {
        id: "inc_toy_003", type: "lease_special", name: "Toyota Lease Deal",
        description: "Lease RAV4 XLE for $299/mo for 36 months", monthlyPayment: 299, term: 36,
        startDate: "2025-10-01", endDate: "2025-12-31",
        make: "Toyota", models: ["RAV4"], region: "Southern California",
      },
    ],
    subaru: [
      {
        id: "inc_sub_001", type: "cash_back", name: "Subaru Share the Love",
        description: "$1,500 customer cash on Outback and Forester", amount: 1500,
        startDate: "2025-11-01", endDate: "2026-01-02",
        make: "Subaru", models: ["Outback", "Forester"], region: "National",
      },
      {
        id: "inc_sub_002", type: "low_apr", name: "Subaru Low APR",
        description: "3.49% APR for 63 months", apr: 3.49, term: 63,
        startDate: "2025-10-01", endDate: "2025-12-31",
        make: "Subaru", models: ["Outback", "Forester", "Crosstrek"], region: "National",
      },
    ],
    honda: [
      {
        id: "inc_hon_001", type: "cash_back", name: "Honda Clearance Event",
        description: "$2,500 customer cash on CR-V", amount: 2500,
        startDate: "2025-10-01", endDate: "2025-12-31",
        make: "Honda", models: ["CR-V"], region: "National",
      },
      {
        id: "inc_hon_002", type: "low_apr", name: "Honda Finance Special",
        description: "1.9% APR for 48 months on CR-V and Civic", apr: 1.9, term: 48,
        startDate: "2025-10-01", endDate: "2025-12-31",
        make: "Honda", models: ["CR-V", "Civic", "Accord"], region: "National",
      },
    ],
  }

  const key = make.toLowerCase().split(" ")[0]
  return configs[key] || configs.toyota
}

function mockReview(make: string, model: string, year?: number): EdmundsReview {
  const configs: Record<string, EdmundsReview> = {
    rivian: {
      vehicleId: "rivian_r1s_2025", make: "Rivian", model: "R1S", year: year || 2025,
      expertRating: 8.4, consumerRating: 4.6, reviewCount: 342,
      pros: ["Incredible off-road capability", "Luxurious interior with tech-forward design", "Zero emissions with 300+ mile range"],
      cons: ["Premium price point", "Limited service network", "Charging infrastructure still developing"],
      editorSummary: "The Rivian R1S continues to impress as a premium electric SUV that doesn't compromise on adventure capability.",
      categories: { driving: 8.5, comfort: 8.8, interior: 9.0, technology: 9.2, storage: 7.5, value: 7.0 },
      sentiment: "very_positive",
    },
    toyota: {
      vehicleId: "toyota_rav4_2025", make: "Toyota", model: model || "RAV4", year: year || 2025,
      expertRating: 7.8, consumerRating: 4.3, reviewCount: 2847,
      pros: ["Excellent reliability reputation", "Strong resale value", "Good fuel economy"],
      cons: ["Infotainment feels dated", "Road noise at highway speeds", "Base engine lacks punch"],
      editorSummary: "The RAV4 remains a smart, reliable choice in the compact SUV segment with Toyota's legendary dependability.",
      categories: { driving: 7.5, comfort: 7.8, interior: 7.0, technology: 6.8, storage: 8.0, value: 8.5 },
      sentiment: "positive",
    },
    subaru: {
      vehicleId: "subaru_outback_2025", make: "Subaru", model: model || "Outback", year: year || 2025,
      expertRating: 7.6, consumerRating: 4.4, reviewCount: 1523,
      pros: ["Standard AWD across lineup", "Excellent ground clearance", "EyeSight safety suite"],
      cons: ["CVT transmission response", "Cabin materials could be better", "Touchscreen lag"],
      editorSummary: "The Outback delivers rugged capability with car-like comfort, making it ideal for active lifestyle buyers.",
      categories: { driving: 7.8, comfort: 7.5, interior: 7.2, technology: 7.0, storage: 8.5, value: 8.0 },
      sentiment: "positive",
    },
  }

  const key = make.toLowerCase().split(" ")[0]
  return configs[key] || configs.toyota
}

function mockMarketData(make: string, model?: string): EdmundsMarketData {
  const configs: Record<string, EdmundsMarketData> = {
    rivian: {
      make: "Rivian", model: model || "R1S", region: "National",
      marketShare: 2.1, salesTrend: "rising", avgTransactionPrice: 79200,
      incentiveSpend: 1200, daysToTurn: 42,
      competitorComparison: [
        { competitor: "Tesla Model X", theirMarketShare: 8.4, theirAvgPrice: 84990, theirDaysToTurn: 28 },
        { competitor: "BMW iX", theirMarketShare: 1.8, theirAvgPrice: 87000, theirDaysToTurn: 55 },
        { competitor: "Mercedes EQS SUV", theirMarketShare: 1.2, theirAvgPrice: 105000, theirDaysToTurn: 68 },
      ],
      shopperInterest: {
        searchVolume: 245000, trend: "up",
        topSearchTerms: ["rivian r1s review", "rivian r1s price", "rivian vs tesla", "rivian range", "rivian r1s 2025"],
      },
    },
    toyota: {
      make: "Toyota", model: model || "RAV4", region: "National",
      marketShare: 12.8, salesTrend: "stable", avgTransactionPrice: 34800,
      incentiveSpend: 2800, daysToTurn: 28,
      competitorComparison: [
        { competitor: "Honda CR-V", theirMarketShare: 10.2, theirAvgPrice: 33500, theirDaysToTurn: 22 },
        { competitor: "Hyundai Tucson", theirMarketShare: 6.4, theirAvgPrice: 31200, theirDaysToTurn: 35 },
        { competitor: "Subaru Forester", theirMarketShare: 4.1, theirAvgPrice: 35800, theirDaysToTurn: 38 },
      ],
      shopperInterest: {
        searchVolume: 820000, trend: "flat",
        topSearchTerms: ["rav4 price", "rav4 hybrid", "rav4 vs cr-v", "toyota rav4 2025", "rav4 lease deals"],
      },
    },
    subaru: {
      make: "Subaru", model: model || "Outback", region: "National",
      marketShare: 4.1, salesTrend: "stable", avgTransactionPrice: 38200,
      incentiveSpend: 1500, daysToTurn: 35,
      competitorComparison: [
        { competitor: "Toyota RAV4", theirMarketShare: 12.8, theirAvgPrice: 34800, theirDaysToTurn: 28 },
        { competitor: "Honda CR-V", theirMarketShare: 10.2, theirAvgPrice: 33500, theirDaysToTurn: 22 },
        { competitor: "Mazda CX-50", theirMarketShare: 2.8, theirAvgPrice: 36400, theirDaysToTurn: 40 },
      ],
      shopperInterest: {
        searchVolume: 380000, trend: "up",
        topSearchTerms: ["subaru outback review", "outback vs forester", "subaru outback 2025", "outback wilderness", "subaru awd"],
      },
    },
  }

  const key = make.toLowerCase().split(" ")[0]
  return configs[key] || configs.toyota
}
