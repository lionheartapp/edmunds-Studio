// lib/ai.ts — AI Client for Edmunds Studio
// Supports Google Gemini (primary) with Anthropic Claude as fallback

import { GoogleGenerativeAI } from "@google/generative-ai"

const GEMINI_MODEL = "gemini-2.5-flash"

function getGemini() {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error("No Gemini API key configured (set GOOGLE_GEMINI_API_KEY)")
  return new GoogleGenerativeAI(apiKey)
}

/**
 * Send a message to the AI and get a text response.
 */
export async function askAI(
  systemPrompt: string,
  userMessage: string,
  options?: {
    maxTokens?: number
    temperature?: number
  }
): Promise<string> {
  const genAI = getGemini()
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: systemPrompt,
    generationConfig: {
      maxOutputTokens: options?.maxTokens ?? 4096,
      temperature: options?.temperature ?? 0.7,
    },
  })

  const result = await model.generateContent(userMessage)
  const response = result.response
  return response.text()
}

/**
 * Send a message to the AI and parse the response as JSON.
 * Uses Gemini's native JSON mode for reliable structured output.
 */
export async function askAIJSON<T>(
  systemPrompt: string,
  userMessage: string,
  options?: {
    maxTokens?: number
    temperature?: number
  }
): Promise<T> {
  const genAI = getGemini()

  // Use Gemini's native JSON response mode for reliable structured output
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: systemPrompt + "\n\nRespond with ONLY valid JSON. No markdown, no explanation.",
    generationConfig: {
      maxOutputTokens: options?.maxTokens ?? 8192,
      temperature: options?.temperature ?? 0.7,
      responseMimeType: "application/json",
    },
  })

  const result = await model.generateContent(userMessage)
  const text = result.response.text()

  // With JSON mode, the response should be clean JSON
  // But add fallback extraction just in case
  try {
    return JSON.parse(text) as T
  } catch {
    console.warn("[ai] Direct JSON parse failed, trying extraction. First 200 chars:", text.substring(0, 200))

    // Try extracting from markdown blocks or finding the JSON object
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || text.match(/(\{[\s\S]*\})/)
    if (!jsonMatch) {
      console.error("[ai] No JSON found in response. First 300 chars:", text.substring(0, 300))
      throw new Error("Could not parse JSON from AI response")
    }

    const jsonStr = jsonMatch[1] || jsonMatch[0]
    try {
      return JSON.parse(jsonStr) as T
    } catch (parseError) {
      console.error("[ai] JSON parse failed. First 300 chars of extracted:", jsonStr.substring(0, 300))
      throw new Error(`JSON parse error: ${parseError instanceof Error ? parseError.message : String(parseError)}`)
    }
  }
}

/**
 * Check if AI is configured and available.
 */
export function isAIConfigured(): boolean {
  return !!(process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY)
}
