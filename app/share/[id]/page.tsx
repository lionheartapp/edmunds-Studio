"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import type { OemCampaign } from "@/lib/oem-types"
import ApprovalView from "@/components/share/ApprovalView"

export default function SharePage() {
  const params = useParams()
  const id = params.id as string

  const [campaign, setCampaign] = useState<OemCampaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    fetch(`/api/oem/campaign?id=${id}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: "Campaign not found" }))
          throw new Error(data.error || "Campaign not found")
        }
        return res.json()
      })
      .then((data: OemCampaign) => {
        setCampaign(data)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load campaign")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-eds-50 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-zinc-400">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center space-y-3 max-w-md mx-auto px-6">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-white">{error || "Campaign not found"}</h1>
          <p className="text-sm text-zinc-500">
            This campaign may have expired or the link may be incorrect.
          </p>
        </div>
      </div>
    )
  }

  return <ApprovalView campaign={campaign} />
}
