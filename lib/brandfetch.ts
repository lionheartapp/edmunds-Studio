// lib/brandfetch.ts — Brandfetch API Integration
// ═══════════════════════════════════════════════════════════════
// Fetches real brand data: logos (SVG/PNG), colors, fonts,
// and descriptions from the Brandfetch API.
// Docs: https://docs.brandfetch.com/reference/brand-api
// ═══════════════════════════════════════════════════════════════

const BRANDFETCH_API_KEY = process.env.BRANDFETCH_API_KEY || ""

export function isBrandfetchConfigured(): boolean {
  return !!BRANDFETCH_API_KEY
}

// ─── Types ──────────────────────────────────────────────────

interface BrandfetchLogo {
  type: string // "logo", "icon", "symbol"
  theme: string // "light", "dark"
  formats: {
    src: string
    background: string | null
    format: string // "svg", "png"
    size?: number
  }[]
}

interface BrandfetchColor {
  hex: string
  type: string // "accent", "brand", "dark", "light", "vibrant"
  brightness: number
}

interface BrandfetchFont {
  name: string
  type: string // "title", "body"
  origin: string
  originId: string
  weights: number[]
}

interface BrandfetchImage {
  type: string // "banner", "icon"
  formats: {
    src: string
    background: string | null
    format: string
    size?: number
  }[]
}

export interface BrandfetchResult {
  name: string
  domain: string
  description: string
  longDescription: string
  logos: BrandfetchLogo[]
  colors: BrandfetchColor[]
  fonts: BrandfetchFont[]
  images: BrandfetchImage[]
  links: { name: string; url: string }[]
  qualityScore: number
  claimed: boolean
}

// ─── API ────────────────────────────────────────────────────

/**
 * Fetch brand data from Brandfetch API.
 * Pass a domain like "rivian.com" or a brand name like "Rivian"
 */
export async function fetchBrand(brandNameOrDomain: string): Promise<BrandfetchResult | null> {
  if (!BRANDFETCH_API_KEY) {
    console.warn("[brandfetch] No API key configured")
    return null
  }

  // Convert brand name to domain if needed
  const domain = brandNameOrDomain.includes(".")
    ? brandNameOrDomain
    : `${brandNameOrDomain.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`

  try {
    console.log(`[brandfetch] Fetching brand data for: ${domain}`)

    const response = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`, {
      headers: {
        Authorization: `Bearer ${BRANDFETCH_API_KEY}`,
      },
    })

    if (!response.ok) {
      // Try alternative domains for known automotive brands
      if (response.status === 404) {
        const altDomain = getAlternativeDomain(brandNameOrDomain)
        if (altDomain && altDomain !== domain) {
          console.log(`[brandfetch] Trying alternative domain: ${altDomain}`)
          return fetchBrandByDomain(altDomain)
        }
      }
      console.warn(`[brandfetch] API returned ${response.status} for ${domain}`)
      return null
    }

    const data = await response.json()
    console.log(`[brandfetch] Got brand data for ${domain}: ${data.logos?.length || 0} logos, ${data.colors?.length || 0} colors`)

    return {
      name: data.name || brandNameOrDomain,
      domain: data.domain || domain,
      description: data.description || "",
      longDescription: data.longDescription || "",
      logos: data.logos || [],
      colors: data.colors || [],
      fonts: data.fonts || [],
      images: data.images || [],
      links: data.links || [],
      qualityScore: data.qualityScore || 0,
      claimed: data.claimed || false,
    }
  } catch (error) {
    console.error(`[brandfetch] Error fetching ${domain}:`, error)
    return null
  }
}

async function fetchBrandByDomain(domain: string): Promise<BrandfetchResult | null> {
  try {
    const response = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`, {
      headers: {
        Authorization: `Bearer ${BRANDFETCH_API_KEY}`,
      },
    })

    if (!response.ok) return null
    const data = await response.json()

    return {
      name: data.name || domain,
      domain: data.domain || domain,
      description: data.description || "",
      longDescription: data.longDescription || "",
      logos: data.logos || [],
      colors: data.colors || [],
      fonts: data.fonts || [],
      images: data.images || [],
      links: data.links || [],
      qualityScore: data.qualityScore || 0,
      claimed: data.claimed || false,
    }
  } catch {
    return null
  }
}

// ─── Helpers ────────────────────────────────────────────────

/**
 * Known alternative domains for automotive brands
 */
function getAlternativeDomain(brand: string): string | null {
  const alternatives: Record<string, string> = {
    rivian: "rivian.com",
    tesla: "tesla.com",
    toyota: "toyota.com",
    honda: "honda.com",
    ford: "ford.com",
    chevrolet: "chevrolet.com",
    chevy: "chevrolet.com",
    bmw: "bmw.com",
    mercedes: "mercedes-benz.com",
    "mercedes-benz": "mercedes-benz.com",
    audi: "audi.com",
    subaru: "subaru.com",
    hyundai: "hyundai.com",
    kia: "kia.com",
    nissan: "nissan.com",
    mazda: "mazda.com",
    lexus: "lexus.com",
    acura: "acura.com",
    infiniti: "infiniti.com",
    volvo: "volvocars.com",
    porsche: "porsche.com",
    "land rover": "landrover.com",
    landrover: "landrover.com",
    jaguar: "jaguar.com",
    cadillac: "cadillac.com",
    lincoln: "lincoln.com",
    buick: "buick.com",
    gmc: "gmc.com",
    ram: "ramtrucks.com",
    jeep: "jeep.com",
    dodge: "dodge.com",
    chrysler: "chrysler.com",
    lucid: "lucidmotors.com",
    polestar: "polestar.com",
    genesis: "genesis.com",
    vw: "volkswagen.com",
    volkswagen: "volkswagen.com",
    edmunds: "edmunds.com",
  }

  const key = brand.toLowerCase().trim()
  return alternatives[key] || null
}

/**
 * Extract the best logo URL from Brandfetch data.
 * Prefers: SVG > PNG, icon/symbol > full logo, dark theme
 */
export function getBestLogoUrl(result: BrandfetchResult): string | null {
  if (!result.logos || result.logos.length === 0) return null

  // Prefer icon or symbol for compact display, fall back to full logo
  const preferred = result.logos.find(l => l.type === "icon" || l.type === "symbol")
    || result.logos.find(l => l.type === "logo")
    || result.logos[0]

  if (!preferred || !preferred.formats || preferred.formats.length === 0) return null

  // Prefer SVG, then PNG
  const svg = preferred.formats.find(f => f.format === "svg")
  if (svg) return svg.src

  const png = preferred.formats.find(f => f.format === "png")
  if (png) return png.src

  return preferred.formats[0]?.src || null
}

/**
 * Extract the full logo URL (wider/larger, good for headers)
 */
export function getFullLogoUrl(result: BrandfetchResult): string | null {
  if (!result.logos || result.logos.length === 0) return null

  const fullLogo = result.logos.find(l => l.type === "logo")
    || result.logos[0]

  if (!fullLogo || !fullLogo.formats || fullLogo.formats.length === 0) return null

  const svg = fullLogo.formats.find(f => f.format === "svg")
  if (svg) return svg.src

  const png = fullLogo.formats.find(f => f.format === "png")
  if (png) return png.src

  return fullLogo.formats[0]?.src || null
}

/**
 * Extract brand colors in a structured format.
 * Returns { primary, secondary, accent, background }
 */
export function extractColors(result: BrandfetchResult): {
  primary: string
  secondary: string
  accent: string
  background: string
} {
  const colors = result.colors || []

  // Find colors by type
  const brandColor = colors.find(c => c.type === "brand" || c.type === "accent")
  const darkColor = colors.find(c => c.type === "dark")
  const lightColor = colors.find(c => c.type === "light")
  const vibrantColor = colors.find(c => c.type === "vibrant")

  // Sort by brightness for fallbacks
  const sorted = [...colors].sort((a, b) => a.brightness - b.brightness)

  return {
    primary: brandColor?.hex || sorted[0]?.hex || "#3B82F6",
    secondary: vibrantColor?.hex || sorted[1]?.hex || darkColor?.hex || "#6366F1",
    accent: vibrantColor?.hex || brandColor?.hex || sorted[2]?.hex || "#10B981",
    background: lightColor?.hex || "#ffffff",
  }
}

/**
 * Extract font information
 */
export function extractFonts(result: BrandfetchResult): {
  primaryFont: string
  fallback: string
  headingWeight: string
} {
  const fonts = result.fonts || []

  const titleFont = fonts.find(f => f.type === "title")
  const bodyFont = fonts.find(f => f.type === "body")
  const anyFont = fonts[0]

  const primary = titleFont?.name || anyFont?.name || "Inter"
  const fallback = bodyFont?.name || "system-ui, sans-serif"
  const weights = titleFont?.weights || anyFont?.weights || [700]
  const headingWeight = Math.max(...weights).toString()

  return { primaryFont: primary, fallback, headingWeight }
}
