// app/api/image/route.ts — Image Generation Endpoint (Google Imagen 3)

import { NextRequest, NextResponse } from "next/server"
import { generateImage } from "@/lib/imagen"
import { askClaude } from "@/lib/claude"
import { IMAGE_PROMPT_SYSTEM, IMAGE_PROMPT_USER } from "@/prompts/image-prompt"
import { CreativeBrief } from "@/lib/types"

// Placeholder images for demo mode
const DEMO_IMAGES: Record<string, string> = {
  rivian: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1920&h=1080&fit=crop",
  subaru: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1920&h=1080&fit=crop",
  default: "https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=1920&h=1080&fit=crop",
}

export async function POST(request: NextRequest) {
  try {
    const { brief, customPrompt } = (await request.json()) as {
      brief: CreativeBrief
      customPrompt?: string
    }

    if (!brief) {
      return NextResponse.json(
        { error: "Creative brief is required" },
        { status: 400 }
      )
    }

    // If no API keys, return demo placeholder image
    if (!process.env.GOOGLE_CLOUD_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      const brandKey = (brief.brand || "").toLowerCase()
      const imageUrl = DEMO_IMAGES[brandKey] || DEMO_IMAGES.default
      return NextResponse.json({
        imageUrl,
        prompt: `[Demo mode] ${brief.imagePrompt || "Professional automotive ad photography"}`,
      })
    }

    // Use custom prompt or have Claude generate an optimized one
    let imagePrompt = customPrompt || brief.imagePrompt

    if (!imagePrompt) {
      imagePrompt = await askClaude(
        IMAGE_PROMPT_SYSTEM,
        IMAGE_PROMPT_USER(JSON.stringify(brief, null, 2)),
        { temperature: 0.8 }
      )
    }

    const result = await generateImage(imagePrompt, {
      width: 1920,
      height: 1080,
    })

    return NextResponse.json({
      imageUrl: result.imageUrl,
      prompt: imagePrompt,
    })
  } catch (error) {
    console.error("[image] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
