// lib/claude.ts — Claude API Client for AdGenAI

import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const MODEL = "claude-sonnet-4-6" as const

/**
 * Send a message to Claude and get a text response.
 */
export async function askClaude(
  systemPrompt: string,
  userMessage: string,
  options?: {
    maxTokens?: number
    temperature?: number
  }
): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: options?.maxTokens ?? 4096,
    temperature: options?.temperature ?? 0.7,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  })

  const textBlock = response.content.find((block) => block.type === "text")
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude")
  }
  return textBlock.text
}

/**
 * Send a message to Claude and parse the response as JSON.
 */
export async function askClaudeJSON<T>(
  systemPrompt: string,
  userMessage: string,
  options?: {
    maxTokens?: number
    temperature?: number
  }
): Promise<T> {
  const text = await askClaude(systemPrompt, userMessage, options)

  // Extract JSON from response — Claude may wrap it in ```json blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || text.match(/(\{[\s\S]*\})/)
  if (!jsonMatch) {
    console.error("[claude] No JSON found in response. First 200 chars:", text.substring(0, 200))
    throw new Error("Could not parse JSON from Claude response")
  }

  const jsonStr = jsonMatch[1] || jsonMatch[0]
  try {
    return JSON.parse(jsonStr) as T
  } catch (parseError) {
    console.error("[claude] JSON parse failed. First 200 chars of extracted:", jsonStr.substring(0, 200))
    throw new Error(`JSON parse error: ${parseError instanceof Error ? parseError.message : String(parseError)}`)
  }
}

/**
 * Stream a message from Claude for live UI updates.
 */
export async function streamClaude(
  systemPrompt: string,
  userMessage: string,
  onChunk: (text: string) => void,
  options?: {
    maxTokens?: number
    temperature?: number
  }
): Promise<string> {
  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: options?.maxTokens ?? 4096,
    temperature: options?.temperature ?? 0.7,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  })

  let fullText = ""
  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      fullText += event.delta.text
      onChunk(event.delta.text)
    }
  }

  return fullText
}

export default anthropic
