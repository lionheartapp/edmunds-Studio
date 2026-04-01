# AdGenAI Prompt Engineering Guide

## Prompt Architecture

Every Claude interaction uses a **system prompt + user prompt** pair. System prompts define the role and rules. User prompts provide the specific input and expected output format.

All prompts live in `prompts/*.ts` as exported constants.

## The 6 Prompts

### 1. Brand DNA Analysis (`prompts/brand-dna.ts`)

**Role**: Brand Intelligence Engine
**Input**: Brand name or domain
**Output**: BrandDNA JSON

Key rules in the system prompt:
- Be specific with hex colors — no generic #000000 unless accurate
- For dealers, use parent OEM guidelines as foundation
- Voice attributes = what you'd tell a copywriter
- Visual style = what you'd tell a photographer
- Acknowledge uncertainty rather than fabricating

**Temperature**: 0.5 (lower for factual accuracy)

### 2. Creative Brief (`prompts/creative-brief.ts`)

**Role**: Creative Director
**Input**: BrandDNA JSON + campaign description
**Output**: CreativeBrief JSON

This is the most critical prompt — it drives the entire pipeline. Key rules:
- Headline: 6 words or fewer, no filler
- CTA: Action-oriented, platform-appropriate
- Voiceover: Written for speech (natural rhythm, 15-30 seconds)
- Image prompt: Detailed, photorealistic, cinematic, NO text in image
- Platform-aware: Different rules for each social format

**Temperature**: 0.7 (balanced creativity + structure)

### 3. Image Prompt Generator (`prompts/image-prompt.ts`)

**Role**: Automotive photographer / art director
**Input**: CreativeBrief JSON
**Output**: Plain text prompt for Imagen 3

Prompt structure: Subject → Setting → Lighting → Camera → Mood → Color → Style

Critical rules:
- NEVER include text, logos, or watermarks
- Focus on ONE hero moment
- Specific camera angles: "low angle hero shot", not "nice angle"
- Real-world lighting: "golden hour backlighting", not "good lighting"
- Under 200 words

**Temperature**: 0.8 (more creative for visual descriptions)

### 4. Figma Layout Spec (`prompts/figma-spec.ts`)

**Role**: Senior visual designer
**Input**: CreativeBrief + platform + dimensions
**Output**: JSON layout specification with layer positions

Rules:
- Safe zones: 10% inward from all edges
- Visual hierarchy: Image > Headline > Subheadline > CTA
- CTA in bottom third (feed) or bottom quarter (stories)
- Minimum 4.5:1 contrast ratio

### 5. After Effects Motion (`prompts/ae-script.ts`)

**Role**: Motion graphics expert
**Input**: CreativeBrief + platform + duration
**Output**: Timeline description with easing and keyframes

Describes animation in terms of:
- Layer order and timing (exact seconds)
- Keyframe positions and easing curves
- Scale changes (percentages)
- Position offsets (pixels from center)
- Opacity transitions (0-100)

### 6. Voiceover Script (`prompts/voice-script.ts`)

**Role**: Voiceover copywriter
**Input**: CreativeBrief + target duration
**Output**: Plain text voiceover script

Rules:
- Write for the ear, not the eye
- Short sentences, natural pauses
- Include [PAUSE] markers
- ~2.5 words per second at normal pace
- No hashtags, URLs, emojis
- Avoid clichés ("redefine", "game-changer", "next level")

**Temperature**: 0.7

## Claude Client Usage Patterns

```typescript
// Simple text response
const text = await askClaude(systemPrompt, userMessage)

// Typed JSON response (auto-extracts from ```json blocks)
const brief = await askClaudeJSON<CreativeBrief>(systemPrompt, userMessage)

// Streaming for live UI
const full = await streamClaude(systemPrompt, userMessage, (chunk) => {
  // Update UI with each chunk
})
```

## Prompt Testing Strategy

Test every prompt against the three demo briefs:
1. **Rivian** — Premium OEM, cinematic outdoor style
2. **Valley Subaru** — Local dealer, community-focused
3. **AutoNation Toyota** — Generic dealer, price-focused

A good prompt produces meaningfully different output for each — if the three briefs look similar, the prompt isn't differentiated enough.

## Common Prompt Issues

| Problem | Fix |
|---------|-----|
| Generic headlines | Add "6 words or fewer, no filler words" to system prompt |
| Text in generated images | Add "NEVER include text" (caps) to image prompt |
| Voiceover too long | Specify exact word count, not just duration |
| Colors don't match brand | Pass hex codes explicitly in user prompt |
| Same output every time | Increase temperature, add "generate 3 options" |
