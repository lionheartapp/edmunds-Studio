"use client"

import { useRouter } from "next/navigation"
import CampaignDashboard from "@/components/CampaignDashboard"
import { CampaignPerformance } from "@/lib/types"

// Demo performance data
const DEMO_PERFORMANCE: CampaignPerformance[] = [
  {
    campaignId: "camp_001",
    platform: "instagram_feed",
    impressions: 45200,
    clicks: 1830,
    ctr: 0.0405,
    engagement: 3420,
    spend: 450,
    conversions: 89,
    roas: 4.2,
    topVariant: "v1",
    insightSummary: "",
  },
  {
    campaignId: "camp_001",
    platform: "tiktok",
    impressions: 128500,
    clicks: 5140,
    ctr: 0.04,
    engagement: 12800,
    spend: 320,
    conversions: 156,
    roas: 6.8,
    topVariant: "v3",
    insightSummary: "",
  },
  {
    campaignId: "camp_001",
    platform: "facebook_feed",
    impressions: 31400,
    clicks: 1100,
    ctr: 0.035,
    engagement: 2100,
    spend: 280,
    conversions: 62,
    roas: 3.5,
    topVariant: "v2",
    insightSummary: "",
  },
]

export default function DashboardPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen py-12">
      <CampaignDashboard
        performance={DEMO_PERFORMANCE}
        insightSummary="Your TikTok urgency variant is outperforming by 62%. The emotional angle resonates strongest on Instagram. Consider doubling TikTok budget and running a follow-up campaign focused on the urgency angle across all platforms."
        onCreateNext={() => router.push("/")}
      />
    </div>
  )
}
