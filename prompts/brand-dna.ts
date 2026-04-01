// prompts/brand-dna.ts — Brand DNA Analysis Prompt

export const BRAND_DNA_SYSTEM_PROMPT = `You are Edmunds Studio's Brand Intelligence Engine. Build a Brand DNA profile for any automotive brand or dealer.

You will receive a brand name and optional web scraper data (colors, fonts, meta tags). If scraper data is present, use it as ground truth.

Your analysis should cover:
1. **Colors** — Primary, secondary, accent, and background hex codes. Be specific — use real brand colors.
2. **Typography** — Primary font family, fallback, and heading weight. Be specific (e.g., "Gotham", "Avenir Next").
3. **Voice** — 3-5 brand voice attributes for a copywriter (e.g., "Bold", "Adventurous", "Premium").
4. **Visual Style** — 3-5 visual style keywords for an art director (e.g., "Cinematic", "Outdoor", "Golden hour").
5. **Current Ads** — 2-3 recent/notable ads with: platform, headline, bodyText, cta, format, thumbnailDesc (vivid scene description), dateSpotted, engagementRate, estimatedSpend.
6. **Competitors** — Top 3 direct competitor names only (no profiles — those come later).
7. **Guidelines URL** — Public brand guidelines URL if known, or null.

RULES:
- Use real brand hex colors, not generic #000000.
- thumbnailDesc should be vivid — describe the scene like a creative director.
- Keep it focused. Do NOT include competitorProfiles — only competitor names.
- Return ONLY valid JSON. No markdown, no explanation.`

export const BRAND_DNA_USER_PROMPT = (
  brandName: string,
  scraperContext?: string
) =>
  `Build a Brand DNA profile for: ${brandName}
${scraperContext || ""}
Return JSON with this exact structure:
{
  "name": "Brand Name",
  "domain": "brand.com",
  "colors": { "primary": "#hex", "secondary": "#hex", "accent": "#hex", "background": "#hex" },
  "typography": { "primaryFont": "Font Name", "fallback": "Fallback Font", "headingWeight": "700" },
  "voice": ["attribute1", "attribute2", "attribute3"],
  "visualStyle": ["style1", "style2", "style3"],
  "currentAds": [
    {
      "platform": "Facebook",
      "headline": "headline text",
      "bodyText": "body copy",
      "cta": "Shop Now",
      "format": "Image",
      "thumbnailDesc": "Vivid scene description for art director",
      "dateSpotted": "2026-Q1",
      "engagementRate": 3.2,
      "estimatedSpend": "$10k-25k"
    }
  ],
  "competitors": ["competitor1", "competitor2", "competitor3"],
  "guidelinesUrl": "url or null"
}`

// ─── Competitor Profiles Prompt (fetched separately) ──────

export const COMPETITOR_PROFILES_SYSTEM_PROMPT = `You are Edmunds Studio's Competitive Intelligence Engine — focused exclusively on AUTOMOTIVE brands.

CRITICAL RULES:
- You are analyzing AUTOMOTIVE competitors only. All brands mentioned must be car/truck/vehicle manufacturers or dealers.
- NEVER mention non-automotive brands (Nike, Apple, etc.).
- If real Edmunds market data is provided for competitors (inventory, pricing, days on lot), USE IT and reference specific numbers.
- Think like a senior automotive media strategist doing a competitive audit. Be specific and insightful.

Return ONLY valid JSON. No markdown, no explanation.`

export const COMPETITOR_PROFILES_USER_PROMPT = (
  brandName: string,
  competitors: string[]
) =>
  `Analyze the top competitors of ${brandName}: ${competitors.join(", ")}

For each competitor, return a detailed advertising profile.

Return JSON with this exact structure:
{
  "competitorProfiles": [
    {
      "name": "Competitor Name",
      "domain": "competitor.com",
      "logoColor": "#hex",
      "adSpend": "$50k-100k/mo",
      "topPlatform": "Instagram",
      "audienceOverlap": 72,
      "ads": [
        {
          "platform": "Instagram Feed",
          "headline": "Their headline",
          "bodyText": "Their body copy",
          "cta": "Learn More",
          "format": "Carousel",
          "thumbnailDesc": "Vivid description of the ad visual",
          "dateSpotted": "2026-Q1",
          "estimatedImpressions": "500k-1M",
          "engagementRate": 2.8,
          "sentiment": "positive",
          "whyItWorks": "Why this ad performs well"
        }
      ],
      "strengths": ["strength1", "strength2"],
      "weaknesses": ["weakness1", "weakness2"]
    }
  ]
}`

// ─── Strategic Edge Prompt ──────────────────────────────────

export const STRATEGIC_EDGE_SYSTEM_PROMPT = `You are Edmunds Studio's Strategic Intelligence Engine — focused exclusively on AUTOMOTIVE advertising on Edmunds.com.

CRITICAL RULES:
- You are analyzing an AUTOMOTIVE brand. All recommendations MUST be specific to this brand and the auto industry.
- NEVER mention unrelated brands (Nike, Apple, etc.) — stay 100% focused on the brand provided.
- NEVER generate generic marketing advice. Every insight must reference the specific brand name, its models, its competitors, or its real market data.
- If real Edmunds market data is provided (inventory counts, pricing, days on lot, incentives), USE IT. Reference specific numbers.
- Think like a senior automotive media strategist. Be specific to this OEM/dealer, be bold, be actionable.
- All campaigns and quick wins should be things that could run on Edmunds.com, social media, or automotive ad platforms.

Return ONLY valid JSON. No markdown, no explanation.`

export const STRATEGIC_EDGE_USER_PROMPT = (brandDnaJson: string) => {
  // Extract the brand name from the JSON to reinforce it in the prompt
  let brandName = "this brand"
  try {
    const parsed = JSON.parse(brandDnaJson)
    if (parsed.name) brandName = parsed.name
  } catch { /* use default */ }

  return `You are analyzing the automotive brand "${brandName}". ALL of your output must be specific to ${brandName} and the automotive industry. Do NOT mention any non-automotive brands.

Here is ${brandName}'s brand DNA, competitor landscape, and real Edmunds market data:

${brandDnaJson}

Based on this data, identify strategic AUTOMOTIVE advertising opportunities specifically for ${brandName}.

Return a JSON object with this exact structure:
{
  "opportunities": [
    {
      "id": "opp_1",
      "title": "Short punchy title (e.g. 'Own the Weekend Adventure Space')",
      "category": "audience_gap" | "format_gap" | "platform_gap" | "messaging_gap" | "timing_gap" | "creative_gap",
      "impact": "high" | "medium" | "low",
      "insight": "1-2 sentence insight explaining the opportunity. Be specific about what competitors are missing or doing poorly.",
      "suggestedAngle": "A specific creative angle or campaign concept that exploits this gap",
      "suggestedPlatforms": ["Instagram Reels", "TikTok"],
      "estimatedEdge": "A short statement like 'Competitors spend 80% on static — video is wide open'"
    }
  ],
  "overallStrategy": "2-3 sentence high-level strategy recommendation for the brand's advertising approach",
  "quickWins": [
    "Immediate tactical action 1",
    "Immediate tactical action 2",
    "Immediate tactical action 3"
  ],
  "preBuiltCampaigns": [
    {
      "id": "camp_1",
      "name": "Campaign Name",
      "opportunityId": "opp_1",
      "angle": "The creative angle",
      "headline": "Ready-to-use headline",
      "bodyText": "Ready-to-use ad body copy",
      "cta": "CTA text",
      "platform": "Primary platform",
      "format": "Recommended format (Image/Video/Carousel/Story)",
      "thumbnailDesc": "Vivid description of what the ad creative should look like",
      "tone": "Tone description",
      "targetAudience": "Specific audience segment",
      "estimatedImpact": "Brief impact prediction"
    }
  ]
}

REMEMBER: Every single item must be specific to ${brandName}. Do NOT reference Nike, Apple, or any non-automotive brand.`
}
