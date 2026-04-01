// app/api/pipeline/route.ts — Full Pipeline Orchestrator

import { NextRequest, NextResponse } from "next/server"
import { BrandDNA, CreativeBrief, PipelineStage, PipelineStatus } from "@/lib/types"

function getBaseUrl(request: NextRequest): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    `${request.headers.get("x-forwarded-proto") || "https"}://${request.headers.get("host")}` ||
    "http://localhost:3000"
  )
}

/**
 * Orchestrates the full AdGenAI pipeline:
 * Brand DNA → Brief → Image → Figma → AE Script → Voiceover → Variants
 *
 * Uses Server-Sent Events (SSE) to stream progress to the client.
 */
export async function POST(request: NextRequest) {
  try {
    const { brandDna, campaignDescription } = (await request.json()) as {
      brandDna: BrandDNA
      campaignDescription: string
    }

    if (!brandDna || !campaignDescription) {
      return NextResponse.json(
        { error: "Brand DNA and campaign description are required" },
        { status: 400 }
      )
    }

    const baseUrl = getBaseUrl(request)
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (_stage: PipelineStage, status: PipelineStatus) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(status)}\n\n`)
          )
        }

        try {
          // Stage 1: Creative Brief
          sendEvent("creative_brief", {
            stage: "creative_brief",
            status: "running",
            message: "Claude is crafting your creative brief...",
          })

          const briefResponse = await fetch(
            `${baseUrl}/api/analyze`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ brandDna, campaignDescription }),
            }
          )
          const { brief } = (await briefResponse.json()) as { brief: CreativeBrief }

          sendEvent("creative_brief", {
            stage: "creative_brief",
            status: "complete",
            message: "Creative brief ready",
            output: brief,
          })

          // Stage 2: Image Generation
          sendEvent("image_generation", {
            stage: "image_generation",
            status: "running",
            message: "Google Imagen 3 is generating your hero image...",
          })

          const imageResponse = await fetch(
            `${baseUrl}/api/image`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ brief }),
            }
          )
          const { imageUrl } = await imageResponse.json()

          sendEvent("image_generation", {
            stage: "image_generation",
            status: "complete",
            message: "Hero image generated",
            output: { imageUrl },
          })

          // Stage 3: Figma Frames
          sendEvent("figma_generation", {
            stage: "figma_generation",
            status: "running",
            message: "Creating Figma frames for all platforms...",
          })

          const figmaResponse = await fetch(
            `${baseUrl}/api/figma`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ brief, heroImageUrl: imageUrl }),
            }
          )
          const figmaResult = await figmaResponse.json()

          sendEvent("figma_generation", {
            stage: "figma_generation",
            status: "complete",
            message: "Figma frames created",
            output: figmaResult,
          })

          // Stage 4: After Effects Script
          sendEvent("ae_script", {
            stage: "ae_script",
            status: "running",
            message: "Generating After Effects motion graphics script...",
          })

          const aeResponse = await fetch(
            `${baseUrl}/api/afterfx`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                brief,
                platform: brief.platforms[0] || "instagram_feed",
              }),
            }
          )
          const aeResult = await aeResponse.json()

          sendEvent("ae_script", {
            stage: "ae_script",
            status: "complete",
            message: "After Effects script ready",
            output: aeResult,
          })

          // Stage 5: Voiceover
          sendEvent("voiceover", {
            stage: "voiceover",
            status: "running",
            message: "Synthesizing voiceover audio...",
          })

          const voiceResponse = await fetch(
            `${baseUrl}/api/voice`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ brief }),
            }
          )
          const voiceResult = await voiceResponse.json()

          sendEvent("voiceover", {
            stage: "voiceover",
            status: "complete",
            message: "Voiceover synthesized",
            output: voiceResult,
          })

          // Stage 6: Complete
          sendEvent("complete", {
            stage: "complete",
            status: "complete",
            message: "Campaign assets ready for review!",
            output: {
              brief,
              heroImage: imageUrl,
              figma: figmaResult,
              aeScript: aeResult,
              voiceover: voiceResult,
            },
          })
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: String(error) })}\n\n`
            )
          )
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("[pipeline] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
