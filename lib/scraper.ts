// lib/scraper.ts — Brand DNA Scraper
// Extracts colors, typography, voice, and visual style from a brand's web presence
// Works on Vercel serverless (no Puppeteer — uses fetch + HTML parsing)

import { BrandDNA, AdSample } from "./types"

export interface ScraperResult {
  raw: Partial<BrandDNA>
  meta: WebsiteMeta
  cssSignals: CSSSignals
}

interface WebsiteMeta {
  title: string
  description: string
  ogImage: string | null
  themeColor: string | null
  socialLinks: string[]
  keywords: string[]
}

interface CSSSignals {
  colors: string[]
  fontFamilies: string[]
}

/**
 * Scrape and analyze a brand's digital presence to build a BrandDNA profile.
 * Returns both structured brand data and raw scraper signals for Claude to refine.
 */
export async function scrapeBrand(brandInput: string): Promise<ScraperResult> {
  // Normalize: if it looks like a domain, use it; otherwise guess the domain
  const domain = normalizeDomain(brandInput)

  const results = await Promise.allSettled([
    scrapeWebsite(domain),
    analyzeSocialPresence(domain),
    pullAdLibrary(brandInput),
  ])

  const websiteData =
    results[0].status === "fulfilled" ? results[0].value : null
  const socialData =
    results[1].status === "fulfilled" ? results[1].value : null
  const adData = results[2].status === "fulfilled" ? results[2].value : null

  const meta: WebsiteMeta = websiteData?.meta ?? {
    title: "",
    description: "",
    ogImage: null,
    themeColor: null,
    socialLinks: [],
    keywords: [],
  }

  const cssSignals: CSSSignals = websiteData?.css ?? {
    colors: [],
    fontFamilies: [],
  }

  // Build partial BrandDNA from scraped data
  const raw: Partial<BrandDNA> = {
    name: extractBrandName(meta.title, brandInput),
    domain,
  }

  // Extract colors from CSS + theme-color meta
  if (cssSignals.colors.length > 0 || meta.themeColor) {
    const allColors = [
      ...(meta.themeColor ? [meta.themeColor] : []),
      ...cssSignals.colors,
    ]
    const uniqueColors = dedupeColors(allColors)
    if (uniqueColors.length >= 2) {
      raw.colors = {
        primary: uniqueColors[0],
        secondary: uniqueColors[1],
        accent: uniqueColors[2] || uniqueColors[0],
        background: uniqueColors[3] || "#FFFFFF",
      }
    }
  }

  // Extract typography from CSS
  if (cssSignals.fontFamilies.length > 0) {
    raw.typography = {
      primaryFont: cssSignals.fontFamilies[0],
      fallback: cssSignals.fontFamilies[1] || "system-ui",
      headingWeight: "700",
    }
  }

  // Merge social links
  if (socialData?.socialLinks) {
    meta.socialLinks = [
      ...new Set([...meta.socialLinks, ...socialData.socialLinks]),
    ]
  }

  // Merge ad samples
  if (adData?.currentAds?.length) {
    raw.currentAds = adData.currentAds
  }

  return { raw, meta, cssSignals }
}

// ─── Layer 1: Website Scrape ─────────────────────────────────

async function scrapeWebsite(
  domain: string
): Promise<{
  meta: WebsiteMeta
  css: CSSSignals
} | null> {
  try {
    const url = `https://${domain}`
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; AdGenAI/1.0; +https://edmunds-studio.vercel.app)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) return null

    const html = await response.text()

    // Extract meta tags
    const meta: WebsiteMeta = {
      title: extractTag(html, /<title[^>]*>([^<]*)<\/title>/i) || "",
      description:
        extractMetaContent(html, "description") ||
        extractMetaContent(html, "og:description") ||
        "",
      ogImage: extractMetaContent(html, "og:image"),
      themeColor: extractMetaContent(html, "theme-color"),
      socialLinks: extractSocialLinks(html),
      keywords: (extractMetaContent(html, "keywords") || "")
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
    }

    // Extract CSS color and font signals
    const css = extractCSSSignals(html)

    return { meta, css }
  } catch (error) {
    console.log(`[Scraper] Website fetch failed for ${domain}:`, error)
    return null
  }
}

// ─── Layer 2: Social Media Analysis ──────────────────────────

async function analyzeSocialPresence(
  domain: string
): Promise<{ socialLinks: string[] } | null> {
  // Try to find social profiles from common patterns
  try {
    const brandSlug = domain.replace(/\.(com|io|co|net|org)$/, "")
    const socialPlatforms = [
      `https://www.instagram.com/${brandSlug}`,
      `https://www.tiktok.com/@${brandSlug}`,
      `https://www.facebook.com/${brandSlug}`,
      `https://twitter.com/${brandSlug}`,
      `https://www.youtube.com/@${brandSlug}`,
    ]

    // Check which profiles exist (head requests, fast timeout)
    const checks = await Promise.allSettled(
      socialPlatforms.map(async (url) => {
        const resp = await fetch(url, {
          method: "HEAD",
          redirect: "follow",
          signal: AbortSignal.timeout(2000),
        })
        return resp.ok ? url : null
      })
    )

    const socialLinks = checks
      .filter(
        (r): r is PromiseFulfilledResult<string | null> =>
          r.status === "fulfilled"
      )
      .map((r) => r.value)
      .filter((v): v is string => v !== null)

    return { socialLinks }
  } catch {
    return null
  }
}

// ─── Layer 3: Ad Library / Ad Intelligence ───────────────────

async function pullAdLibrary(
  brandName: string
): Promise<{ currentAds: AdSample[] } | null> {
  // The Meta Ad Library requires OAuth, so for the hackathon we'll
  // let Claude generate ad samples from its training data.
  // This function returns null to signal "let Claude handle it."
  console.log(
    `[Scraper] Ad Library: deferring to Claude for ${brandName}`
  )
  return null
}

// ─── HTML Parsing Helpers ────────────────────────────────────

function extractTag(html: string, regex: RegExp): string | null {
  const match = html.match(regex)
  return match?.[1]?.trim() || null
}

function extractMetaContent(html: string, name: string): string | null {
  // Match both name="..." and property="..." meta tags
  const patterns = [
    new RegExp(
      `<meta[^>]*(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`,
      "i"
    ),
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return match[1]
  }
  return null
}

function extractSocialLinks(html: string): string[] {
  const socialDomains = [
    "instagram.com",
    "tiktok.com",
    "facebook.com",
    "twitter.com",
    "x.com",
    "youtube.com",
    "linkedin.com",
  ]

  const links: string[] = []
  const hrefRegex = /href=["'](https?:\/\/[^"']+)["']/gi
  let match

  while ((match = hrefRegex.exec(html)) !== null) {
    const url = match[1]
    if (socialDomains.some((d) => url.includes(d))) {
      links.push(url)
    }
  }

  return [...new Set(links)]
}

function extractCSSSignals(html: string): CSSSignals {
  const colors: string[] = []
  const fontFamilies: string[] = []

  // Extract hex colors from inline styles and style blocks
  const hexRegex = /#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?=[;\s"',)}])/g
  let colorMatch
  while ((colorMatch = hexRegex.exec(html)) !== null) {
    colors.push(colorMatch[0].toUpperCase())
  }

  // Extract CSS custom property colors (--brand-primary: #xxx)
  const varRegex = /--[\w-]*(?:brand|primary|secondary|accent|main)[\w-]*:\s*(#[0-9a-fA-F]{3,8})/gi
  while ((colorMatch = varRegex.exec(html)) !== null) {
    // Prioritize brand-specific CSS vars by adding them to front
    colors.unshift(colorMatch[1].toUpperCase())
  }

  // Extract font-family declarations
  const fontRegex = /font-family:\s*["']?([^"';,}]+)/gi
  let fontMatch
  while ((fontMatch = fontRegex.exec(html)) !== null) {
    const font = fontMatch[1].trim()
    if (
      !font.match(
        /^(inherit|initial|unset|system-ui|sans-serif|serif|monospace|cursive|fantasy)$/i
      )
    ) {
      fontFamilies.push(font)
    }
  }

  // Extract @font-face src names
  const fontFaceRegex =
    /font-family:\s*["']([^"']+)["'][^}]*src:/gi
  while ((fontMatch = fontFaceRegex.exec(html)) !== null) {
    fontFamilies.unshift(fontMatch[1].trim())
  }

  return {
    colors: dedupeColors(colors).slice(0, 12),
    fontFamilies: [...new Set(fontFamilies)].slice(0, 5),
  }
}

// ─── Utility Helpers ─────────────────────────────────────────

function normalizeDomain(input: string): string {
  // If it looks like a URL, extract the domain
  let domain = input
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .trim()
    .toLowerCase()

  // If no TLD, guess .com
  if (!domain.includes(".")) {
    // Clean up spaces and common brand name patterns
    domain = domain.replace(/\s+/g, "").replace(/[^a-z0-9.-]/g, "") + ".com"
  }

  return domain
}

function extractBrandName(title: string, fallback: string): string {
  if (!title) return fallback

  // Common separators in page titles: " | ", " - ", " — ", " :: "
  const separators = [" | ", " - ", " — ", " :: ", " · "]
  for (const sep of separators) {
    if (title.includes(sep)) {
      return title.split(sep)[0].trim()
    }
  }

  return title.length < 50 ? title : fallback
}

function dedupeColors(colors: string[]): string[] {
  // Normalize to uppercase hex and remove near-black (#000-#111) and near-white (#EEE-#FFF)
  // unless they're the only colors
  const normalized = colors.map((c) => {
    let hex = c.toUpperCase()
    // Expand 3-char hex to 6-char
    if (hex.length === 4) {
      hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    }
    return hex
  })

  const unique = [...new Set(normalized)]

  // Filter out very common/boring colors, but keep them if they're all we have
  const interesting = unique.filter(
    (c) =>
      !["#000000", "#FFFFFF", "#111111", "#EEEEEE", "#F5F5F5", "#333333", "#666666", "#999999", "#CCCCCC"].includes(c)
  )

  return interesting.length >= 2 ? interesting : unique
}

/**
 * Build a context string from scraper results that Claude can use
 * to produce a more accurate Brand DNA analysis.
 */
export function buildScraperContext(result: ScraperResult): string {
  const lines: string[] = []

  if (result.meta.title) lines.push(`Page title: ${result.meta.title}`)
  if (result.meta.description)
    lines.push(`Meta description: ${result.meta.description}`)
  if (result.meta.ogImage) lines.push(`OG image: ${result.meta.ogImage}`)
  if (result.meta.themeColor)
    lines.push(`Theme color: ${result.meta.themeColor}`)
  if (result.meta.keywords.length)
    lines.push(`Keywords: ${result.meta.keywords.join(", ")}`)
  if (result.meta.socialLinks.length)
    lines.push(`Social profiles found: ${result.meta.socialLinks.join(", ")}`)
  if (result.cssSignals.colors.length)
    lines.push(`Colors found in CSS: ${result.cssSignals.colors.join(", ")}`)
  if (result.cssSignals.fontFamilies.length)
    lines.push(
      `Fonts found in CSS: ${result.cssSignals.fontFamilies.join(", ")}`
    )
  if (result.raw.currentAds?.length)
    lines.push(
      `Ad samples found: ${result.raw.currentAds.length} from ad library`
    )

  return lines.length > 0
    ? `\n\nWEB SCRAPER INTELLIGENCE (use to refine your analysis):\n${lines.join("\n")}`
    : ""
}
