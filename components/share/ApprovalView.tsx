"use client"

import { useState, useCallback } from "react"
import type { OemCampaign, CampaignStatus } from "@/lib/oem-types"
import AdPreviewGrid from "@/components/oem/AdPreviewGrid"
import CommentThread from "./CommentThread"

interface ApprovalViewProps {
  campaign: OemCampaign
}

const STATUS_CONFIG: Record<CampaignStatus, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "text-zinc-400", bg: "bg-zinc-500/10" },
  shared: { label: "Pending Review", color: "text-amber-400", bg: "bg-amber-500/10" },
  approved: { label: "Approved", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  rejected: { label: "Rejected", color: "text-red-400", bg: "bg-red-500/10" },
}

export default function ApprovalView({ campaign }: ApprovalViewProps) {
  const [status, setStatus] = useState<CampaignStatus>(campaign.status)
  const [approverName, setApproverName] = useState("")
  const [approving, setApproving] = useState(false)
  const [showApproveForm, setShowApproveForm] = useState(false)

  const handleApprove = useCallback(async () => {
    if (!approverName.trim()) return

    setApproving(true)
    try {
      const response = await fetch("/api/oem/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: campaign.id,
          approverName: approverName.trim(),
        }),
      })

      if (response.ok) {
        setStatus("approved")
        setShowApproveForm(false)
      }
    } catch (err) {
      console.error("Approval failed:", err)
    } finally {
      setApproving(false)
    }
  }, [campaign.id, approverName])

  const statusConfig = STATUS_CONFIG[status]

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center p-1.5 overflow-hidden">
              <img src={campaign.assets.logoUrl} alt={campaign.brandName} className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">{campaign.brandName} Campaign</h1>
              <p className="text-xs text-zinc-500">Created {formatDate(campaign.createdAt)}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color} ${statusConfig.bg}`}>
            {statusConfig.label}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-10">
        {/* Campaign Details */}
        <section>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
              <p className="text-xs text-zinc-500 mb-1">Headline</p>
              <p className="text-sm font-medium text-white">{campaign.copy.headline}</p>
            </div>
            <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
              <p className="text-xs text-zinc-500 mb-1">CTA</p>
              <p className="text-sm font-medium text-white">{campaign.copy.cta}</p>
            </div>
            <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
              <p className="text-xs text-zinc-500 mb-1">Body</p>
              <p className="text-sm text-zinc-300 line-clamp-2">{campaign.copy.bodyText}</p>
            </div>
          </div>
        </section>

        {/* Ad Previews */}
        <section>
          <h2 className="text-xl font-bold tracking-tight mb-4">Ad Previews</h2>
          <AdPreviewGrid
            assets={campaign.assets}
            copy={campaign.copy}
            brandColors={campaign.brandColors}
          />
        </section>

        {/* CTA Score (if available) */}
        {campaign.ctaSuggestions && campaign.ctaSuggestions.length > 0 && (
          <section>
            <h2 className="text-xl font-bold tracking-tight mb-4">CTA Intelligence</h2>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="space-y-3">
                {campaign.ctaSuggestions.slice(0, 3).map((suggestion, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50">
                    <div
                      className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold"
                      style={{
                        backgroundColor: `${getScoreColor(suggestion.score)}15`,
                        color: getScoreColor(suggestion.score),
                      }}
                    >
                      {suggestion.score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">&ldquo;{suggestion.cta}&rdquo;</p>
                      <p className="text-xs text-zinc-500">{suggestion.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Comments */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <CommentThread
            campaignId={campaign.id}
            initialComments={campaign.comments}
          />
        </section>

        {/* Approve Action */}
        {status !== "approved" && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            {showApproveForm ? (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-zinc-300">Approve Campaign</h3>
                <input
                  type="text"
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  placeholder="Your name"
                  maxLength={100}
                  className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-eds-50"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleApprove}
                    disabled={approving || !approverName.trim()}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      approving || !approverName.trim()
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white"
                    }`}
                  >
                    {approving ? "Approving..." : "Approve"}
                  </button>
                  <button
                    onClick={() => setShowApproveForm(false)}
                    className="px-5 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-200 border border-zinc-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowApproveForm(true)}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all"
              >
                Approve Campaign
              </button>
            )}
          </section>
        )}

        {/* Approved state */}
        {status === "approved" && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mx-auto mb-3">
              <circle cx="20" cy="20" r="18" stroke="#22c55e" strokeWidth="2" />
              <path d="M12 20l6 6 10-10" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-emerald-400 font-semibold">Campaign Approved</p>
            {campaign.approvedBy && (
              <p className="text-xs text-zinc-500 mt-1">by {campaign.approvedBy}</p>
            )}
          </div>
        )}

        {/* Expiration notice */}
        <p className="text-xs text-zinc-600 text-center">
          This link expires {formatDate(campaign.expiresAt)}
        </p>
      </main>
    </div>
  )
}

function getScoreColor(score: number): string {
  if (score >= 75) return "#22c55e"
  if (score >= 50) return "#eab308"
  if (score >= 30) return "#f97316"
  return "#ef4444"
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return ""
  }
}
