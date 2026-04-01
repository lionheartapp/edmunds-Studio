# AdGenAI API Reference

## All Routes

All API routes are in `app/api/` using Next.js App Router conventions. Every route exports a `POST` handler using `NextRequest`/`NextResponse`.

---

### POST `/api/brand-dna`

Analyze a brand and return a complete BrandDNA profile.

**Request:**
```json
{ "brandName": "Rivian" }
```

**Response:**
```json
{
  "brandDna": {
    "name": "Rivian",
    "domain": "rivian.com",
    "colors": { "primary": "#48814A", "secondary": "#1A1A1A", "accent": "#F5A623", "background": "#FAFAFA" },
    "typography": { "primaryFont": "Rivian Gothic", "fallback": "Arial", "headingWeight": "700" },
    "voice": ["Adventurous", "Premium", "Sustainable", "Bold", "Authentic"],
    "visualStyle": ["Cinematic outdoor", "Golden hour", "Rugged terrain", "Minimalist product shots"],
    "currentAds": [...],
    "competitors": ["Tesla", "Ford Lightning", "GMC Hummer EV"],
    "guidelinesUrl": null
  }
}
```

**Implementation:** Runs scraper + Claude analysis in parallel via `Promise.allSettled`. Claude is primary; scraper overrides for live data fields.

---

### POST `/api/analyze`

Generate a CreativeBrief from BrandDNA + campaign description.

**Request:**
```json
{
  "brandDna": { ... },
  "campaignDescription": "Launch campaign for the 2026 Rivian R1T Adventure Package..."
}
```

**Response:**
```json
{
  "brief": {
    "brand": "Rivian",
    "product": "2026 R1T Adventure Package",
    "tagline": "Adventure Has a New Address",
    "headline": "400 Miles of Freedom",
    "subheadline": "The R1T Adventure Package — built for the roads you haven't found yet",
    "cta": "Reserve Yours",
    "voiceoverScript": "...",
    "imagePrompt": "...",
    "colorPalette": ["#48814A", "#1A1A1A", "#F5A623"],
    "visualStyle": "cinematic outdoor",
    "motionStyle": "slow cinematic pan with dynamic text reveals",
    "tone": "adventurous and premium",
    "durationSeconds": 15,
    "platforms": ["instagram_feed", "instagram_story", "tiktok", "facebook_feed"]
  }
}
```

---

### POST `/api/image`

Generate a hero image using Google Imagen 3.

**Request:**
```json
{
  "brief": { ... },
  "customPrompt": "optional override prompt"
}
```

**Response:**
```json
{
  "imageUrl": "data:image/png;base64,...",
  "prompt": "The actual prompt sent to Imagen"
}
```

**Note:** If `customPrompt` is not provided and `brief.imagePrompt` is empty, Claude auto-generates an optimized prompt.

---

### POST `/api/figma`

Create platform-sized frames in a Figma file.

**Request:**
```json
{
  "brief": { ... },
  "heroImageUrl": "https://..."
}
```

**Response:**
```json
{
  "fileUrl": "https://www.figma.com/file/...",
  "frameIds": {
    "instagram_feed": "frame_...",
    "instagram_story": "frame_...",
    "tiktok": "frame_...",
    "facebook_feed": "frame_..."
  }
}
```

---

### POST `/api/afterfx`

Generate an After Effects ExtendScript (.jsx) file.

**Request:**
```json
{
  "brief": { ... },
  "platform": "instagram_feed",
  "heroImagePath": "/path/to/hero.png"
}
```

**Response:**
```json
{
  "script": "// AdGenAI — Auto-generated After Effects ExtendScript\n...",
  "platform": "instagram_feed"
}
```

**Note:** The script is pure ExtendScript that runs directly in After Effects. It creates a composition with background, hero image, headline, subheadline, CTA, and animations.

---

### POST `/api/voice`

Synthesize voiceover audio using Google Cloud TTS Neural2.

**Request:**
```json
{
  "brief": { ... },
  "voicePreset": "authoritative_male",
  "customScript": "optional override script"
}
```

**Voice presets:** `authoritative_male`, `warm_female`, `energetic_male`, `professional_female`, `deep_male`, `friendly_female`

**Response:**
```json
{
  "audioUrl": "data:audio/mp3;base64,...",
  "durationEstimate": 12.5,
  "script": "The voiceover text that was synthesized"
}
```

---

### POST `/api/pipeline`

**SSE endpoint.** Orchestrates all stages sequentially and streams progress.

**Request:**
```json
{
  "brandDna": { ... },
  "campaignDescription": "..."
}
```

**Response:** `text/event-stream` with events:

```
data: {"stage":"creative_brief","status":"running","message":"Claude is crafting your creative brief..."}

data: {"stage":"creative_brief","status":"complete","message":"Creative brief ready","output":{...}}

data: {"stage":"image_generation","status":"running","message":"Google Imagen 3 is generating your hero image..."}

...

data: {"stage":"complete","status":"complete","message":"Campaign assets ready for review!","output":{"brief":...,"heroImage":...,"figma":...,"aeScript":...,"voiceover":...}}
```

**Client-side consumption:**
```typescript
const reader = response.body?.getReader()
const decoder = new TextDecoder()
while (true) {
  const { done, value } = await reader.read()
  if (done) break
  const lines = decoder.decode(value).split('\n').filter(l => l.startsWith('data: '))
  for (const line of lines) {
    const event = JSON.parse(line.slice(6))
    // Update UI based on event.stage and event.status
  }
}
```

---

### POST `/api/publish`

Publish scheduled content to Meta and TikTok.

**Request:**
```json
{
  "slots": [
    {
      "platform": "instagram_feed",
      "variantId": "v1",
      "scheduledAt": "2026-04-02T14:00:00Z",
      "caption": "...",
      "hashtags": ["#rivian", "#adventure"],
      "status": "draft"
    }
  ],
  "assets": {
    "instagram_feed": "https://...",
    "tiktok": "https://..."
  }
}
```

**Response:**
```json
{
  "results": [
    { "platform": "instagram_feed", "success": true, "id": "meta_..." },
    { "platform": "tiktok", "success": true, "id": "tiktok_..." }
  ]
}
```

---

## Error Handling

All routes return structured errors:

```json
{
  "error": "Human-readable error message"
}
```

Status codes: `400` for bad input, `500` for server errors. Client should display the error message directly (UX Rule 8: errors in plain English with a suggested fix).
