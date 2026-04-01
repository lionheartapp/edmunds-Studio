"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AssetReview from "@/components/AssetReview"
import { CampaignVariant } from "@/lib/types"

// Demo variants for testing
const DEMO_VARIANTS: CampaignVariant[] = [
  {
    id: "v1",
    angle: "emotional",
    headline: "Where Will You Go?",
    description: "Taps into the spirit of adventure and freedom. Aspirational imagery, open landscapes.",
    assets: {} as CampaignVariant["assets"],
  },
  {
    id: "v2",
    angle: "rational",
    headline: "800 HP. Zero Emissions.",
    description: "Leads with specs and technology. Clean design, data-forward layout.",
    assets: {} as CampaignVariant["assets"],
  },
  {
    id: "v3",
    angle: "urgency",
    headline: "$5,000 Off — This Week Only",
    description: "Time-limited offer. Bold colors, countdown energy, strong CTA.",
    assets: {} as CampaignVariant["assets"],
  },
]

export default function ReviewPage() {
  const router = useRouter()
  const [variants, setVariants] = useState<CampaignVariant[]>(DEMO_VARIANTS)

  useEffect(() => {
    const output = sessionStorage.getItem("eds_campaign_output")
    if (output) {
      const parsed = JSON.parse(output)
      if (parsed.variants?.length) {
        setVariants(parsed.variants)
      }
    }
  }, [])

  return (
    <div className="min-h-screen py-12">
      <AssetReview
        variants={variants}
        onApprove={(id) => console.log("Approved:", id)}
        onTweak={(id, instruction) => console.log("Tweak:", id, instruction)}
        onApproveAll={() => router.push("/schedule")}
      />
    </div>
  )
}
