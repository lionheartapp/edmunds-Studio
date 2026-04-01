// lib/figma.ts — Figma API Helpers

import { Platform, PLATFORM_DIMENSIONS, CreativeBrief } from "./types"

const FIGMA_API = "https://api.figma.com/v1"

function getHeaders() {
  const token = process.env.FIGMA_ACCESS_TOKEN
  if (!token) throw new Error("FIGMA_ACCESS_TOKEN is not set")
  return {
    "X-Figma-Token": token,
    "Content-Type": "application/json",
  }
}

/**
 * Create platform-sized frames in a Figma file for each target platform.
 */
export async function createFigmaFrames(
  brief: CreativeBrief,
  heroImageUrl: string
): Promise<{ fileUrl: string; frameIds: Record<Platform, string> }> {
  const fileKey = process.env.FIGMA_FILE_KEY
  if (!fileKey) throw new Error("FIGMA_FILE_KEY is not set")

  const frameIds: Partial<Record<Platform, string>> = {}

  // Generate frame specifications for each platform
  const frameSpecs = brief.platforms.map((platform) => {
    const dims = PLATFORM_DIMENSIONS[platform]
    return {
      platform,
      name: `${brief.brand} — ${dims.label}`,
      width: dims.width,
      height: dims.height,
      headline: brief.headline,
      subheadline: brief.subheadline,
      cta: brief.cta,
      colorPalette: brief.colorPalette,
    }
  })

  // TODO: Use Figma Plugin API to create actual frames
  // For now, return a mock URL — real implementation will use
  // the Figma REST API or a Figma plugin running in-browser
  for (const spec of frameSpecs) {
    frameIds[spec.platform] = `frame_${spec.platform}_${Date.now()}`
  }

  return {
    fileUrl: `https://www.figma.com/file/${fileKey}`,
    frameIds: frameIds as Record<Platform, string>,
  }
}

/**
 * Export a Figma frame as PNG.
 */
export async function exportFrame(
  fileKey: string,
  nodeId: string,
  scale: number = 2
): Promise<string> {
  const response = await fetch(
    `${FIGMA_API}/images/${fileKey}?ids=${nodeId}&scale=${scale}&format=png`,
    { headers: getHeaders() }
  )

  if (!response.ok) {
    throw new Error(`Figma export error: ${response.status}`)
  }

  const data = await response.json()
  return data.images[nodeId]
}

/**
 * Get file metadata.
 */
export async function getFileInfo(fileKey: string) {
  const response = await fetch(`${FIGMA_API}/files/${fileKey}`, {
    headers: getHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status}`)
  }

  return response.json()
}
