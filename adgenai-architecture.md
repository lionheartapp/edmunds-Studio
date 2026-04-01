# AdGenAI System Architecture

## Pipeline Overview

AdGenAI orchestrates 7 AI/API services into a single pipeline that converts a brand name into a publishable ad campaign.

```
① User enters brand name
② Claude builds Brand DNA Profile (5 parallel intelligence layers)
③ User reviews + confirms Brand DNA card
④ User inputs campaign brief (chat / quick form / upload)
⑤ Claude generates CreativeBrief JSON
⑥ Google Imagen 3 generates hero image (Claude writes the prompt)
⑦ Figma API creates platform-sized frames (IG, TikTok, FB, YT)
⑧ Claude generates After Effects ExtendScript (.jsx)
⑨ Google TTS synthesizes voiceover audio
⑩ User reviews A/B/C variants (emotional / rational / urgency)
⑪ User tweaks via conversation
⑫ User approves and schedules (Claude pre-fills optimal times)
⑬ Campaign publishes to Meta + TikTok
⑭ Performance data feeds back to Claude for insights
```

## Tech Stack

| Layer | Technology | Integration Point |
|-------|-----------|-------------------|
| Frontend | Next.js 14 App Router | `app/` directory |
| Styling | Tailwind CSS + Framer Motion | Every component |
| AI Orchestration | Claude API (claude-sonnet-4-6) | `lib/claude.ts` |
| Image Generation | Google Imagen 3 (Gemini API) | `lib/imagen.ts` |
| Voice Synthesis | Google Cloud TTS Neural2 | `lib/tts.ts` |
| Design Generation | Figma Plugin API | `lib/figma.ts` |
| Motion Graphics | After Effects ExtendScript | `lib/aftereffects.ts` |
| Social Publishing | Meta Marketing API + TikTok API | `lib/social.ts` |
| Storage | Supabase Storage | Temp asset hosting |
| Deployment | Vercel | Zero config |

## API Routes

| Route | Method | Purpose | Input | Output |
|-------|--------|---------|-------|--------|
| `/api/brand-dna` | POST | Analyze brand | `{ brandName }` | `{ brandDna: BrandDNA }` |
| `/api/analyze` | POST | Generate brief | `{ brandDna, campaignDescription }` | `{ brief: CreativeBrief }` |
| `/api/image` | POST | Generate hero image | `{ brief, customPrompt? }` | `{ imageUrl, prompt }` |
| `/api/figma` | POST | Create Figma frames | `{ brief, heroImageUrl }` | `{ fileUrl, frameIds }` |
| `/api/afterfx` | POST | Generate AE script | `{ brief, platform, heroImagePath? }` | `{ script, platform }` |
| `/api/voice` | POST | Synthesize voiceover | `{ brief, voicePreset?, customScript? }` | `{ audioUrl, durationEstimate, script }` |
| `/api/pipeline` | POST | Full pipeline (SSE) | `{ brandDna, campaignDescription }` | SSE stream of PipelineStatus events |
| `/api/publish` | POST | Social publishing | `{ slots, assets }` | `{ results }` |

## SSE Pipeline Protocol

The `/api/pipeline` route streams Server-Sent Events. Each event is a JSON object:

```typescript
// Running event
{ stage: "creative_brief", status: "running", message: "Claude is crafting..." }

// Complete event
{ stage: "creative_brief", status: "complete", message: "Brief ready", output: { ... } }

// Error event
{ error: "Error message" }

// Final event
{ stage: "complete", status: "complete", output: { brief, heroImage, figma, aeScript, voiceover } }
```

Client-side parsing in `app/pipeline/page.tsx` uses `ReadableStream` reader.

## Brand DNA Engine — 5 Intelligence Layers

All run in parallel via `Promise.allSettled`:

1. **Website Scrape** — Colors from CSS, typography from stylesheets, tone from copy
2. **Brand Guidelines Hunt** — Search brand portals, press kits, Google for PDF guidelines
3. **Social Media Analysis** — Instagram grid, TikTok, Facebook, YouTube analysis
4. **Facebook Ad Library** — Currently running ads, formats, headlines, CTAs
5. **Competitor Intelligence** — Top 3 competitors identified and analyzed

In MVP: Claude does the heavy lifting from training data. Scraper module provides the scaffolding for real web-based analysis in Phase 2.

## Platform Dimensions

```typescript
const PLATFORM_DIMENSIONS = {
  instagram_feed:  { width: 1080, height: 1080 },
  instagram_story: { width: 1080, height: 1920 },
  tiktok:          { width: 1080, height: 1920 },
  facebook_feed:   { width: 1200, height: 628  },
  facebook_story:  { width: 1080, height: 1920 },
  youtube_preroll: { width: 1920, height: 1080 },
}
```

## Data Flow

```
BrandDNA (from brand-dna route)
    ↓
CreativeBrief (from analyze route) ← campaign description from user
    ↓ branches to:
    ├── Image generation (image route) → heroImageUrl
    ├── Figma frames (figma route) → figmaFileUrl
    ├── AE script (afterfx route) → aeScriptPath
    ├── Voiceover (voice route) → voiceoverUrl
    └── Variant generation (Claude) → 3 CampaignVariants
    ↓ merges into:
CampaignOutput (displayed in review page)
    ↓
ScheduleSlot[] (scheduling page)
    ↓
Published (publish route → Meta + TikTok APIs)
```
