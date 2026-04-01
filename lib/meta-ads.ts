// lib/meta-ads.ts — Meta Ad Library API Integration
// ═══════════════════════════════════════════════════════════════
// Pulls real active ads from the Meta Ad Library for any brand.
// API Docs: https://www.facebook.com/ads/library/api
//
// Requires a Meta (Facebook) access token with ads_read permission.
// Set META_AD_LIBRARY_TOKEN in your environment.
// ═══════════════════════════════════════════════════════════════

const META_ACCESS_TOKEN = process.env.META_AD_LIBRARY_TOKEN || ""
const META_API_VERSION = "v21.0"
const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`

export function isMetaAdsConfigured(): boolean {
  return !!META_ACCESS_TOKEN
}

// ─── Types ──────────────────────────────────────────────────

export interface MetaAd {
  id: string
  ad_creation_time: string
  ad_creative_bodies?: string[]
  ad_creative_link_captions?: string[]
  ad_creative_link_descriptions?: string[]
  ad_creative_link_titles?: string[]
  ad_delivery_start_time: string
  ad_delivery_stop_time?: string
  ad_snapshot_url?: string
  bylines?: string
  currency?: string
  impressions?: { lower_bound: string; upper_bound: string }
  spend?: { lower_bound: string; upper_bound: string }
  page_id?: string
  page_name?: string
  publisher_platforms?: string[]
  languages?: string[]
  target_locations?: { name: string; type: string }[]
  estimated_audience_size?: { lower_bound: string; upper_bound: string }
}

export interface MetaAdResult {
  ads: MetaAdFormatted[]
  totalCount: number
  pageId?: string
  pageName?: string
  source: "meta_api" | "mock"
}

export interface MetaAdFormatted {
  id: string
  headline: string
  bodyText: string
  cta: string
  platform: string
  format: string
  imageUrl?: string
  snapshotUrl?: string
  dateSpotted: string
  impressionsRange?: string
  spendRange?: string
  isActive: boolean
}

// ─── Core API Call ──────────────────────────────────────────

/**
 * Search the Meta Ad Library for active ads by a brand/page name.
 * Returns formatted ad data ready for the UI.
 */
export async function searchMetaAds(
  brandName: string,
  options: {
    country?: string
    limit?: number
    adType?: "ALL" | "POLITICAL_AND_ISSUE_ADS"
  } = {}
): Promise<MetaAdResult> {
  const { country = "US", limit = 10, adType = "ALL" } = options

  if (!isMetaAdsConfigured()) {
    console.log("[meta-ads] No META_AD_LIBRARY_TOKEN configured, returning mock data")
    return buildMockMetaAds(brandName)
  }

  try {
    // First, try to find the page ID for the brand
    const pageId = await findPageId(brandName)

    const params = new URLSearchParams({
      access_token: META_ACCESS_TOKEN,
      ad_reached_countries: `["${country}"]`,
      ad_active_status: "ACTIVE",
      ad_type: adType,
      limit: limit.toString(),
      fields: [
        "id",
        "ad_creation_time",
        "ad_creative_bodies",
        "ad_creative_link_captions",
        "ad_creative_link_descriptions",
        "ad_creative_link_titles",
        "ad_delivery_start_time",
        "ad_delivery_stop_time",
        "ad_snapshot_url",
        "bylines",
        "impressions",
        "spend",
        "page_id",
        "page_name",
        "publisher_platforms",
        "languages",
      ].join(","),
      ...(pageId
        ? { search_page_ids: pageId }
        : { search_terms: brandName }),
    })

    const response = await fetch(`${META_API_BASE}/ads_archive?${params.toString()}`, {
      headers: { "User-Agent": "Edmunds-Studio/1.0" },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[meta-ads] API error (${response.status}):`, errorText)
      return buildMockMetaAds(brandName)
    }

    const data = await response.json()
    const rawAds: MetaAd[] = data.data || []

    if (rawAds.length === 0) {
      console.log(`[meta-ads] No ads found for "${brandName}", returning mock`)
      return buildMockMetaAds(brandName)
    }

    const formatted = rawAds.map(formatMetaAd)

    return {
      ads: formatted,
      totalCount: rawAds.length,
      pageId: rawAds[0]?.page_id,
      pageName: rawAds[0]?.page_name || brandName,
      source: "meta_api",
    }
  } catch (err) {
    console.error("[meta-ads] searchMetaAds failed:", err instanceof Error ? err.message : err)
    return buildMockMetaAds(brandName)
  }
}

// ─── Helpers ────────────────────────────────────────────────

async function findPageId(brandName: string): Promise<string | null> {
  try {
    // The Ad Library API can search by page name directly,
    // but if we have a known page ID mapping, use it for accuracy
    const knownPages: Record<string, string> = {
      ford: "55407073575",
      toyota: "152958894754149",
      honda: "24aborhood985643963",
      chevrolet: "56381590540",
      bmw: "7316286060",
      rivian: "113137726741998",
      subaru: "36063054094",
      hyundai: "118294911555838",
      kia: "100750236310",
      tesla: "141051539262549",
      nissan: "33994012689",
      jeep: "36143588455",
      mercedes: "134810753208849",
      audi: "27845843648",
      volkswagen: "35583936487",
      mazda: "23515996524",
      lexus: "60744668675",
      gmc: "59498428018",
      ram: "95441993197",
      dodge: "57868790364",
    }

    const key = brandName.toLowerCase().replace(/[^a-z]/g, "")
    return knownPages[key] || null
  } catch {
    return null
  }
}

function formatMetaAd(raw: MetaAd): MetaAdFormatted {
  const headline =
    raw.ad_creative_link_titles?.[0] ||
    raw.ad_creative_link_captions?.[0] ||
    ""

  const bodyText =
    raw.ad_creative_bodies?.[0] ||
    raw.ad_creative_link_descriptions?.[0] ||
    ""

  // Extract CTA from link description or default
  const cta = raw.ad_creative_link_descriptions?.[0]?.match(
    /(?:Shop|Learn|Get|Buy|Discover|Explore|See|Visit|Build|Configure|Schedule|Reserve)\s.{0,30}/i
  )?.[0] || "Learn More"

  // Determine primary platform
  const platforms = raw.publisher_platforms || ["facebook"]
  const platform = platforms.includes("instagram")
    ? "Instagram"
    : platforms.includes("facebook")
      ? "Facebook"
      : platforms[0] || "Facebook"

  // Determine format heuristic
  const format = bodyText.length > 200 ? "Carousel" : "Image"

  // Format impressions range
  const impressionsRange = raw.impressions
    ? `${formatCompact(parseInt(raw.impressions.lower_bound))} - ${formatCompact(parseInt(raw.impressions.upper_bound))}`
    : undefined

  // Format spend range
  const spendRange = raw.spend
    ? `$${formatCompact(parseInt(raw.spend.lower_bound))} - $${formatCompact(parseInt(raw.spend.upper_bound))}`
    : undefined

  return {
    id: raw.id,
    headline,
    bodyText: bodyText.slice(0, 300),
    cta,
    platform,
    format,
    snapshotUrl: raw.ad_snapshot_url,
    dateSpotted: raw.ad_delivery_start_time?.split("T")[0] || "",
    impressionsRange,
    spendRange,
    isActive: !raw.ad_delivery_stop_time,
  }
}

function formatCompact(n: number): string {
  if (isNaN(n)) return "0"
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return n.toString()
}

// ─── Mock Data ──────────────────────────────────────────────

function buildMockMetaAds(brandName: string): MetaAdResult {
  const now = new Date()
  const daysAgo = (d: number) => {
    const date = new Date(now)
    date.setDate(date.getDate() - d)
    return date.toISOString().split("T")[0]
  }

  const brandAds: Record<string, MetaAdFormatted[]> = {
    ford: [
      {
        id: "mock_ford_1",
        headline: "The All-New Ford F-150 Lightning",
        bodyText: "Go further than you ever imagined. The F-150 Lightning combines legendary toughness with next-gen electric power.",
        cta: "Build & Price",
        platform: "Facebook",
        format: "Video",
        snapshotUrl: "https://www.facebook.com/ads/library/?id=mock",
        dateSpotted: daysAgo(3),
        impressionsRange: "1M - 5M",
        spendRange: "$50K - $100K",
        isActive: true,
      },
      {
        id: "mock_ford_2",
        headline: "Ford Explorer: Adventure Awaits",
        bodyText: "Room for the whole crew and then some. The Ford Explorer is built for families who refuse to stay still.",
        cta: "Explore Now",
        platform: "Instagram",
        format: "Carousel",
        snapshotUrl: "https://www.facebook.com/ads/library/?id=mock",
        dateSpotted: daysAgo(7),
        impressionsRange: "500K - 1M",
        spendRange: "$25K - $50K",
        isActive: true,
      },
      {
        id: "mock_ford_3",
        headline: "0% APR for 60 Months on Select Models",
        bodyText: "Don't miss out on incredible savings this spring. Visit your local Ford dealer today.",
        cta: "Find a Dealer",
        platform: "Facebook",
        format: "Image",
        snapshotUrl: "https://www.facebook.com/ads/library/?id=mock",
        dateSpotted: daysAgo(1),
        impressionsRange: "2M - 5M",
        spendRange: "$75K - $150K",
        isActive: true,
      },
    ],
    toyota: [
      {
        id: "mock_toyota_1",
        headline: "Toyota RAV4: Let's Go Places",
        bodyText: "The best-selling SUV in America. Adventure-ready with available AWD and 41 combined MPGe.",
        cta: "Build Yours",
        platform: "Instagram",
        format: "Video",
        snapshotUrl: "https://www.facebook.com/ads/library/?id=mock",
        dateSpotted: daysAgo(2),
        impressionsRange: "1M - 5M",
        spendRange: "$40K - $80K",
        isActive: true,
      },
      {
        id: "mock_toyota_2",
        headline: "Camry: Style Meets Performance",
        bodyText: "Redesigned from the ground up. The all-new Camry delivers a driving experience unlike any sedan before it.",
        cta: "Discover More",
        platform: "Facebook",
        format: "Carousel",
        snapshotUrl: "https://www.facebook.com/ads/library/?id=mock",
        dateSpotted: daysAgo(5),
        impressionsRange: "500K - 1M",
        spendRange: "$30K - $60K",
        isActive: true,
      },
      {
        id: "mock_toyota_3",
        headline: "ToyotaCare: 2 Years Free Maintenance",
        bodyText: "Every new Toyota comes with ToyotaCare, a complimentary maintenance plan covering normal factory-scheduled service.",
        cta: "Learn More",
        platform: "Facebook",
        format: "Image",
        snapshotUrl: "https://www.facebook.com/ads/library/?id=mock",
        dateSpotted: daysAgo(4),
        impressionsRange: "2M - 5M",
        spendRange: "$50K - $100K",
        isActive: true,
      },
    ],
  }

  const key = brandName.toLowerCase().replace(/[^a-z]/g, "")
  const ads = brandAds[key] || [
    {
      id: `mock_${key}_1`,
      headline: `${brandName} Spring Sales Event`,
      bodyText: `Discover the ${brandName} lineup. Incredible offers on our most popular models this season.`,
      cta: "Shop Now",
      platform: "Facebook",
      format: "Video",
      snapshotUrl: "https://www.facebook.com/ads/library/?id=mock",
      dateSpotted: daysAgo(2),
      impressionsRange: "500K - 1M",
      spendRange: "$25K - $50K",
      isActive: true,
    },
    {
      id: `mock_${key}_2`,
      headline: `The All-New ${brandName} Lineup`,
      bodyText: `Experience innovation, performance, and style. The ${brandName} family of vehicles has something for everyone.`,
      cta: "Explore Models",
      platform: "Instagram",
      format: "Carousel",
      snapshotUrl: "https://www.facebook.com/ads/library/?id=mock",
      dateSpotted: daysAgo(5),
      impressionsRange: "250K - 500K",
      spendRange: "$15K - $30K",
      isActive: true,
    },
    {
      id: `mock_${key}_3`,
      headline: `${brandName} Certified Pre-Owned`,
      bodyText: `Quality you can trust. Every ${brandName} CPO vehicle passes a rigorous multi-point inspection.`,
      cta: "Find Yours",
      platform: "Facebook",
      format: "Image",
      snapshotUrl: "https://www.facebook.com/ads/library/?id=mock",
      dateSpotted: daysAgo(8),
      impressionsRange: "100K - 250K",
      spendRange: "$10K - $20K",
      isActive: true,
    },
  ]

  return {
    ads,
    totalCount: ads.length,
    pageName: brandName,
    source: "mock",
  }
}
