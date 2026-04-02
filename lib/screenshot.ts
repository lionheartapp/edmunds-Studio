// lib/screenshot.ts — Headless Chromium screenshot capture for Meta Ad Library previews
// ═══════════════════════════════════════════════════════════════════════════════════════
// Uses the shared browser launcher from lib/browser.ts.
// Captures JPEG screenshots of ad snapshot pages for caching in Supabase.
// ═══════════════════════════════════════════════════════════════════════════════════════

import type { Browser } from "puppeteer-core"
import { launchBrowser, configurePage } from "./browser"

const JPEG_QUALITY = 85
const NAVIGATION_TIMEOUT_MS = 30_000
const RENDER_SETTLE_MS = 2_000
const VIEWPORT = { width: 600, height: 800, deviceScaleFactor: 2 }

/**
 * Capture a JPEG screenshot of a Meta Ad Library snapshot page.
 * Returns a Buffer containing the JPEG image data.
 */
export async function screenshotAd(snapshotUrl: string): Promise<Buffer> {
  let browser: Browser | null = null

  try {
    browser = await launchBrowser(VIEWPORT)
    const page = await browser.newPage()
    await configurePage(page)

    // Navigate to the snapshot URL
    await page.goto(snapshotUrl, {
      waitUntil: "networkidle0",
      timeout: NAVIGATION_TIMEOUT_MS,
    })

    // Hide cookie consent / overlay elements
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

    // Wait for ad content to render + safety buffer
    await page.waitForSelector("body", { timeout: 5_000 }).catch(() => {})
    await new Promise((resolve) => setTimeout(resolve, RENDER_SETTLE_MS))

    // Capture viewport screenshot as JPEG
    const screenshotBuffer = await page.screenshot({
      type: "jpeg",
      quality: JPEG_QUALITY,
      clip: {
        x: 0,
        y: 0,
        width: VIEWPORT.width,
        height: VIEWPORT.height,
      },
    })

    // puppeteer returns Uint8Array — convert to Buffer for Supabase upload
    return Buffer.from(screenshotBuffer)
  } finally {
    if (browser) {
      await browser.close().catch(() => {})
    }
  }
}
