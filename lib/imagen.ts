// lib/imagen.ts — Google Imagen 3 Client

/**
 * Generate a hero image using Google Imagen 3 via the Gemini API.
 * Returns a base64-encoded image or a URL depending on configuration.
 */
export async function generateImage(
  prompt: string,
  options?: {
    width?: number
    height?: number
    negativePrompt?: string
    sampleCount?: number
  }
): Promise<{ imageUrl: string; base64?: string }> {
  const apiKey = process.env.GOOGLE_CLOUD_API_KEY
  if (!apiKey) throw new Error("GOOGLE_CLOUD_API_KEY is not set")

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [
          {
            prompt,
            negativePrompt: options?.negativePrompt || "text, watermark, logo, blurry, distorted",
          },
        ],
        parameters: {
          sampleCount: options?.sampleCount || 1,
          aspectRatio: getAspectRatio(options?.width, options?.height),
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Imagen API error: ${response.status} — ${error}`)
  }

  const data = await response.json()
  const imageBytes = data.predictions?.[0]?.bytesBase64Encoded

  if (!imageBytes) {
    throw new Error("No image returned from Imagen API")
  }

  // TODO: Upload to Supabase Storage and return public URL
  return {
    imageUrl: `data:image/png;base64,${imageBytes}`,
    base64: imageBytes,
  }
}

function getAspectRatio(width?: number, height?: number): string {
  if (!width || !height) return "1:1"
  const ratio = width / height
  if (Math.abs(ratio - 1) < 0.1) return "1:1"
  if (Math.abs(ratio - 16 / 9) < 0.1) return "16:9"
  if (Math.abs(ratio - 9 / 16) < 0.1) return "9:16"
  if (Math.abs(ratio - 4 / 3) < 0.1) return "4:3"
  if (Math.abs(ratio - 3 / 4) < 0.1) return "3:4"
  return "1:1"
}
