// lib/meta-ads-scraper.ts — Scrape the public Meta Ad Library website
// ═══════════════════════════════════════════════════════════════════════
// Navigates to facebook.com/ads/library, intercepts GraphQL responses
// for structured ad data, falls back to DOM scraping, and captures
// screenshots of the first N ads in the same browser session.
// ═══════════════════════════════════════════════════════════════════════

import type { Browser, Page, HTTPResponse } from "puppeteer-core"
import { launchBrowser, configurePage } from "./browser"

// ─── Types ──────────────────────────────────────────────────

export interface ScrapedAd {
  id: string
  pageName: string
  bodyText: string
  headline: string
  linkCaption: string
  startDate: string
  snapshotUrl: string
  platform: string
  isActive: boolean
}

export interface ScrapeResult {
  ads: ScrapedAd[]
  screenshotBuffers: Map<string, Buffer>
}

// ─── Constants ──────────────────────────────────────────────

const AD_LIBRARY_BASE = "https://www.facebook.com/ads/library"
const NAVIGATION_TIMEOUT_MS = 25_000
const SCROLL_SETTLE_MS = 2_000
const SCREENSHOT_TIMEOUT_MS = 15_000
const MAX_GRAPHQL_WAIT_MS = 10_000
const JPEG_QUALITY = 85

// ─── Main Entry ─────────────────────────────────────────────

/**
 * Scrape the Meta Ad Library for active ads matching `brandName`.
 * Returns structured ad data + pre-captured screenshot buffers.
 */
export async function scrapeMetaAdLibrary(
  brandName: string,
  options: { country?: string; limit?: number } = {}
): Promise<ScrapeResult> {
  const { country = "US", limit = 6 } = options
  let browser: Browser | null = null

  try {
    browser = await launchBrowser({ width: 1280, height: 900, deviceScaleFactor: 1 })
    const page = await browser.newPage()
    await configurePage(page)

    // Build search URL
    const searchUrl = buildSearchUrl(brandName, country)
    console.log(`[meta-scraper] Navigating to: ${searchUrl}`)

    // Set up GraphQL interceptor BEFORE navigation
    const graphqlAds = new Map<string, ScrapedAd>()
    const graphqlPromise = interceptGraphQL(page, graphqlAds, limit)

    // Navigate to the Ad Library
    await page.goto(searchUrl, {
      waitUntil: "networkidle2",
      timeout: NAVIGATION_TIMEOUT_MS,
    })

    // Dismiss cookie consent if present
    await dismissCookieConsent(page)

    // Scroll to trigger lazy-loaded ad cards
    await scrollForAds(page)

    // Wait for GraphQL responses (with timeout)
    await graphqlPromise

    let ads: ScrapedAd[]

    if (graphqlAds.size > 0) {
      console.log(`[meta-scraper] GraphQL intercepted ${graphqlAds.size} ads`)
      ads = [...graphqlAds.values()].slice(0, limit)
    } else {
      // DOM fallback
      console.log("[meta-scraper] No GraphQL data, trying DOM fallback")
      ads = await scrapeFromDOM(page, limit)
    }

    if (ads.length === 0) {
      console.log("[meta-scraper] No ads found via any method")
      return { ads: [], screenshotBuffers: new Map() }
    }

    // Capture screenshots of first 3 ads (reuse same browser)
    const maxScreenshots = Math.min(3, ads.length)
    const screenshotBuffers = await captureAdScreenshots(
      browser,
      ads.slice(0, maxScreenshots)
    )

    console.log(
      `[meta-scraper] Done: ${ads.length} ads, ${screenshotBuffers.size} screenshots`
    )

    return { ads, screenshotBuffers }
  } catch (err) {
    console.error(
      "[meta-scraper] scrapeMetaAdLibrary failed:",
      err instanceof Error ? err.message : err
    )
    return { ads: [], screenshotBuffers: new Map() }
  } finally {
    if (browser) {
      await browser.close().catch(() => {})
    }
  }
}

// ─── URL Builder ────────────────────────────────────────────

function buildSearchUrl(brandName: string, country: string): string {
  const params = new URLSearchParams({
    active_status: "active",
    ad_type: "all",
    country: country,
    q: brandName,
    media_type: "all",
  })
  return `${AD_LIBRARY_BASE}/?${params.toString()}`
}

// ─── GraphQL Interceptor ────────────────────────────────────

/**
 * Listen for /api/graphql/ responses and extract ad nodes by field signature.
 * Resolves after MAX_GRAPHQL_WAIT_MS or once `limit` ads are found.
 */
function interceptGraphQL(
  page: Page,
  adsMap: Map<string, ScrapedAd>,
  limit: number
): Promise<void> {
  return new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      page.off("response", handler)
      resolve()
    }, MAX_GRAPHQL_WAIT_MS)

    const handler = async (response: HTTPResponse) => {
      try {
        const url = response.url()
        if (!url.includes("/api/graphql") && !url.includes("graphql")) return
        if (response.status() !== 200) return

        const text = await response.text().catch(() => "")
        if (!text) return

        // Meta often returns multiple JSON objects concatenated
        const jsonChunks = text.split("\n").filter((line) => line.trim().startsWith("{"))

        for (const chunk of jsonChunks) {
          try {
            const json = JSON.parse(chunk)
            extractAdsFromGraphQL(json, adsMap)
          } catch {
            // Not valid JSON, skip
          }
        }

        if (adsMap.size >= limit) {
          clearTimeout(timer)
          page.off("response", handler)
          resolve()
        }
      } catch {
        // Response body may not be available, ignore
      }
    }

    page.on("response", handler)
  })
}

/**
 * Recursively walk a JSON tree looking for ad-like nodes.
 * Signature: objects containing `ad_archive_id` or `adArchiveID`.
 */
function extractAdsFromGraphQL(
  obj: unknown,
  adsMap: Map<string, ScrapedAd>
): void {
  if (obj === null || obj === undefined || typeof obj !== "object") return

  if (Array.isArray(obj)) {
    for (const item of obj) {
      extractAdsFromGraphQL(item, adsMap)
    }
    return
  }

  const record = obj as Record<string, unknown>

  // Check for ad node signatures
  const adId =
    (record.ad_archive_id as string) ??
    (record.adArchiveID as string) ??
    (record.adid as string)

  if (adId && !adsMap.has(adId)) {
    const pageName =
      (record.page_name as string) ??
      ((record.page as Record<string, unknown>)?.name as string) ??
      ""

    const bodyText =
      (record.body as Record<string, unknown>)?.text as string ??
      (record.ad_creative_bodies as string[])?.[0] ??
      (record.body_text as string) ??
      ""

    const headline =
      (record.title as string) ??
      (record.link_title as string) ??
      (record.ad_creative_link_titles as string[])?.[0] ??
      ""

    const linkCaption =
      (record.link_caption as string) ??
      (record.caption as string) ??
      ""

    const startDate =
      (record.start_date as string) ??
      (record.ad_delivery_start_time as string) ??
      (record.startDate as string) ??
      ""

    const snapshotUrl =
      (record.ad_snapshot_url as string) ??
      (record.snapshot_url as string) ??
      ""

    const publisherPlatforms =
      (record.publisher_platforms as string[]) ?? []

    const platform = publisherPlatforms.includes("instagram")
      ? "Instagram"
      : publisherPlatforms.includes("facebook")
        ? "Facebook"
        : "Facebook"

    const isActive =
      !(record.ad_delivery_stop_time as string) &&
      !(record.end_date as string) &&
      !(record.is_active === false)

    adsMap.set(adId, {
      id: adId,
      pageName,
      bodyText: bodyText.slice(0, 300),
      headline,
      linkCaption,
      startDate: startDate.split("T")[0] || "",
      snapshotUrl,
      platform,
      isActive,
    })
  }

  // Recurse into values
  for (const value of Object.values(record)) {
    extractAdsFromGraphQL(value, adsMap)
  }
}

// ─── DOM Fallback ───────────────────────────────────────────

/**
 * Scrape ad data directly from the rendered DOM.
 * Looks for "Started running on" date markers, walks up to ad containers,
 * and extracts visible text.
 */
async function scrapeFromDOM(page: Page, limit: number): Promise<ScrapedAd[]> {
  try {
    const ads = await page.evaluate((maxAds: number) => {
      const results: Array<{
        id: string
        pageName: string
        bodyText: string
        headline: string
        linkCaption: string
        startDate: string
        snapshotUrl: string
        platform: string
        isActive: boolean
      }> = []

      // Strategy 1: Find date markers "Started running on"
      const allElements = document.querySelectorAll("*")
      const dateContainers: Element[] = []

      for (const el of allElements) {
        const text = el.textContent?.trim() ?? ""
        if (
          text.includes("Started running on") &&
          text.length < 200 // Avoid huge parent containers
        ) {
          dateContainers.push(el)
        }
      }

      for (const dateEl of dateContainers) {
        if (results.length >= maxAds) break

        // Walk up to find the ad card container (usually 3-5 levels up)
        let container: Element | null = dateEl
        for (let i = 0; i < 6; i++) {
          if (!container?.parentElement) break
          container = container.parentElement
          // Look for a container with substantial content
          if (container.querySelectorAll("a, img, span").length > 3) break
        }

        if (!container) continue

        // Extract date from "Started running on Mon DD, YYYY"
        const dateMatch = (dateEl.textContent ?? "").match(
          /Started running on\s+(\w+\s+\d{1,2},\s*\d{4})/
        )
        const startDate = dateMatch ? dateMatch[1] : ""

        // Extract page name — usually in a link near the top
        const links = container.querySelectorAll("a")
        let pageName = ""
        for (const link of links) {
          const href = link.getAttribute("href") ?? ""
          if (href.includes("/ads/library/?view_all_page_id=")) {
            pageName = link.textContent?.trim() ?? ""
            break
          }
        }

        // Extract body text — longest text block in the container
        const textBlocks = container.querySelectorAll("span, div, p")
        let bodyText = ""
        for (const block of textBlocks) {
          const t = block.textContent?.trim() ?? ""
          if (t.length > bodyText.length && t.length > 30 && !t.includes("Started running")) {
            bodyText = t
          }
        }

        // Extract snapshot URL from iframe or link
        const iframe = container.querySelector("iframe")
        const snapshotUrl = iframe?.getAttribute("src") ?? ""

        const id = `dom_${results.length}_${Date.now()}`

        results.push({
          id,
          pageName,
          bodyText: bodyText.slice(0, 300),
          headline: "",
          linkCaption: "",
          startDate,
          snapshotUrl,
          platform: "Facebook",
          isActive: true,
        })
      }

      // Strategy 2: If no date markers found, look for ad card patterns
      if (results.length === 0) {
        const cardSelectors = [
          '[class*="AdCard"]',
          '[class*="adCard"]',
          '[data-testid*="ad_"]',
          '[class*="_7jvw"]', // Known Meta ad card class
        ]

        for (const selector of cardSelectors) {
          const cards = document.querySelectorAll(selector)
          for (const card of cards) {
            if (results.length >= maxAds) break
            const text = card.textContent?.trim() ?? ""
            if (text.length < 20) continue

            results.push({
              id: `dom_card_${results.length}_${Date.now()}`,
              pageName: "",
              bodyText: text.slice(0, 300),
              headline: "",
              linkCaption: "",
              startDate: "",
              snapshotUrl: "",
              platform: "Facebook",
              isActive: true,
            })
          }
          if (results.length > 0) break
        }
      }

      return results
    }, limit)

    console.log(`[meta-scraper] DOM fallback found ${ads.length} ads`)
    return ads
  } catch (err) {
    console.error("[meta-scraper] DOM scrape failed:", err)
    return []
  }
}

// ─── Screenshot Capture ─────────────────────────────────────

/**
 * Open snapshot URLs in new tabs and capture JPEG screenshots.
 * Reuses the existing browser session for speed.
 */
async function captureAdScreenshots(
  browser: Browser,
  ads: ScrapedAd[]
): Promise<Map<string, Buffer>> {
  const buffers = new Map<string, Buffer>()

  for (const ad of ads) {
    if (!ad.snapshotUrl) continue

    try {
      const page = await browser.newPage()
      await configurePage(page)

      await page.goto(ad.snapshotUrl, {
        waitUntil: "networkidle2",
        timeout: SCREENSHOT_TIMEOUT_MS,
      })

      // Hide cookie/consent overlays
      await page.addStyleTag({
        content: `
          [class*="cookie"], [id*="cookie"],
          [class*="consent"], [id*="consent"],
          [class*="overlay"], [class*="modal"],
          [data-testid*="cookie"] {
            display: none !important;
            visibility: hidden !important;
          }
        `,
      })

      await new Promise((resolve) => setTimeout(resolve, 1_500))

      const screenshot = await page.screenshot({
        type: "jpeg",
        quality: JPEG_QUALITY,
        clip: { x: 0, y: 0, width: 600, height: 800 },
      })

      buffers.set(ad.id, Buffer.from(screenshot))
      await page.close()
    } catch (err) {
      console.warn(
        `[meta-scraper] Screenshot failed for ad ${ad.id}:`,
        err instanceof Error ? err.message : err
      )
      // Continue — missing screenshot is non-fatal
    }
  }

  return buffers
}

// ─── Helpers ────────────────────────────────────────────────

async function dismissCookieConsent(page: Page): Promise<void> {
  try {
    // Common cookie consent button selectors on Facebook
    const selectors = [
      'button[data-cookiebanner="accept_button"]',
      'button[title="Allow all cookies"]',
      'button[title="Accept All"]',
      '[data-testid="cookie-policy-manage-dialog-accept-button"]',
    ]

    for (const sel of selectors) {
      const btn = await page.$(sel)
      if (btn) {
        await btn.click()
        console.log("[meta-scraper] Dismissed cookie consent")
        await new Promise((resolve) => setTimeout(resolve, 500))
        return
      }
    }
  } catch {
    // Non-fatal
  }
}

async function scrollForAds(page: Page): Promise<void> {
  try {
    await page.evaluate(async () => {
      for (let i = 0; i < 3; i++) {
        window.scrollBy(0, window.innerHeight)
        await new Promise((r) => setTimeout(r, 800))
      }
      window.scrollTo(0, 0)
    })
    await new Promise((resolve) => setTimeout(resolve, SCROLL_SETTLE_MS))
  } catch {
    // Non-fatal
  }
}
