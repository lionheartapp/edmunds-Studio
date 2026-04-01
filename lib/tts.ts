// lib/tts.ts — Google Cloud Text-to-Speech Client

export interface TTSOptions {
  voice?: string // e.g. "en-US-Neural2-D"
  speakingRate?: number // 0.25 to 4.0, default 1.0
  pitch?: number // -20.0 to 20.0
  volumeGainDb?: number
}

/**
 * Synthesize voiceover audio using Google Cloud TTS Neural2.
 * Returns base64-encoded MP3 audio.
 */
export async function synthesizeVoiceover(
  script: string,
  options?: TTSOptions
): Promise<{ audioUrl: string; base64: string; durationEstimate: number }> {
  const apiKey = process.env.GOOGLE_CLOUD_API_KEY
  if (!apiKey) throw new Error("GOOGLE_CLOUD_API_KEY is not set")

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text: script },
        voice: {
          languageCode: "en-US",
          name: options?.voice || "en-US-Neural2-D",
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: options?.speakingRate || 1.0,
          pitch: options?.pitch || 0,
          volumeGainDb: options?.volumeGainDb || 0,
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Google TTS error: ${response.status} — ${error}`)
  }

  const data = await response.json()
  const audioContent = data.audioContent

  if (!audioContent) {
    throw new Error("No audio returned from Google TTS")
  }

  // Rough duration estimate: ~150 words per minute at normal speed
  const wordCount = script.split(/\s+/).length
  const speakingRate = options?.speakingRate || 1.0
  const durationEstimate = (wordCount / 150) * 60 / speakingRate

  // TODO: Upload to Supabase Storage for persistent URL
  return {
    audioUrl: `data:audio/mp3;base64,${audioContent}`,
    base64: audioContent,
    durationEstimate,
  }
}

/**
 * Available Neural2 voices suitable for automotive ads.
 */
export const VOICE_OPTIONS = {
  authoritative_male: "en-US-Neural2-D",
  warm_female: "en-US-Neural2-F",
  energetic_male: "en-US-Neural2-A",
  professional_female: "en-US-Neural2-C",
  deep_male: "en-US-Neural2-J",
  friendly_female: "en-US-Neural2-H",
} as const

export type VoicePreset = keyof typeof VOICE_OPTIONS
