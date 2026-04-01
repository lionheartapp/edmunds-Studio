// app/api/voice/route.ts — Voiceover Synthesis Endpoint (Google TTS)

import { NextRequest, NextResponse } from "next/server"
import { synthesizeVoiceover, VoicePreset, VOICE_OPTIONS } from "@/lib/tts"
import { CreativeBrief } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { brief, voicePreset, customScript } = (await request.json()) as {
      brief: CreativeBrief
      voicePreset?: VoicePreset
      customScript?: string
    }

    if (!brief) {
      return NextResponse.json(
        { error: "Creative brief is required" },
        { status: 400 }
      )
    }

    const script = customScript || brief.voiceoverScript
    if (!script) {
      return NextResponse.json(
        { error: "No voiceover script available" },
        { status: 400 }
      )
    }

    // If no Google Cloud API key, return demo voiceover data
    if (!process.env.GOOGLE_CLOUD_API_KEY) {
      const wordCount = script.split(/\s+/).length
      const durationEstimate = Math.ceil(wordCount / 2.5) // ~2.5 words/sec
      return NextResponse.json({
        audioUrl: null,
        durationEstimate,
        script,
        status: "demo",
      })
    }

    const voice = voicePreset ? VOICE_OPTIONS[voicePreset] : undefined

    const result = await synthesizeVoiceover(script, { voice })

    return NextResponse.json({
      audioUrl: result.audioUrl,
      durationEstimate: result.durationEstimate,
      script,
    })
  } catch (error) {
    console.error("[voice] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
