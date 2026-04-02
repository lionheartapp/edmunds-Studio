// lib/browser.ts — Shared headless Chromium launcher for serverless functions
// ═══════════════════════════════════════════════════════════════════════════
// Centralizes browser setup so screenshot.ts and meta-ads-scraper.ts share
// identical Chromium configuration (binary URL, args, UA, stealth patches).
// ═══════════════════════════════════════════════════════════════════════════

import type { Browser, Page } from "puppeteer-core"

export const CHROMIUM_BINARY_URL =
  "https://github.com/nichochar/chromium-binaries/releases/download/chromium-v131.0.1/chromium-v131.0.1-pack.tar"

export const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

export const DEFAULT_VIEWPORT = {
  width: 600,
  height: 800,
  deviceScaleFactor: 2,
} as const

/**
 * Launch a headless Chromium browser with serverless-friendly args.
 * The binary is downloaded on first call and cached in /tmp.
 */
export async function launchBrowser(
  viewportOverride?: { width: number; height: number; deviceScaleFactor?: number }
): Promise<Browser> {
  const chromium = await import("@sparticuz/chromium-min")
  const puppeteer = await import("puppeteer-core")

  const executablePath = await chromium.default.executablePath(CHROMIUM_BINARY_URL)

  const viewport = viewportOverride
    ? { ...DEFAULT_VIEWPORT, ...viewportOverride }
    : DEFAULT_VIEWPORT

  const browser = await puppeteer.default.launch({
    args: [
      ...chromium.default.args,
      "--no-sandbox",
      "--disable-gpu",
      "--single-process",
      "--disable-dev-shm-usage",
      "--disable-setuid-sandbox",
    ],
    defaultViewport: viewport,
    executablePath,
    headless: true,
  })

  return browser
}

/**
 * Configure a page with realistic UA, stealth patches, and English locale.
 * Call this on every new page before navigation.
 */
export async function configurePage(page: Page): Promise<void> {
  await page.setUserAgent(USER_AGENT)
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false })
  })
  await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" })
}
