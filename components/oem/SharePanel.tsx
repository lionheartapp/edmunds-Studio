"use client"

import { useState, useCallback } from "react"
import type {
  OemAssets,
  OemCopy,
  BrandColors,
  CtaSuggestion,
  OptimizationSet,
  CompetitorIntelData,
} from "@/lib/oem-types"

interface SharePanelProps {
  assets: OemAssets
  copy: OemCopy
  brandColors?: BrandColors
  ctaSuggestions?: CtaSuggestion[]
  optimizations?: OptimizationSet
  competitorIntel?: CompetitorIntelData
  campaignId?: string
  shareUrl?: string
  onSaved: (campaignId: string, shareUrl: string) => void
  onBack: () => void
}

export default function SharePanel({
  assets,
  copy,
  brandColors,
  ctaSuggestions,
  optimizations,
  competitorIntel,
  campaignId,
  shareUrl,
  onSaved,
  onBack,
}: SharePanelProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSave = useCallback(async () => {
    setSaving(true)
    setError(null)

    try {
      const response = await fetch("/api/oem/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: copy.brandName,
          logoUrl: assets.logoUrl,
          imageUrls: assets.imageUrls,
          videoUrl: assets.videoUrl,
          headline: copy.headline,
          cta: copy.cta,
          bodyText: copy.bodyText,
          primaryColor: brandColors?.primary,
          secondaryColor: brandColors?.secondary,
          accentColor: brandColors?.accent,
          ctaSuggestions,
          optimizations,
          competitorIntel,
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Save failed" }))
        throw new Error(err.error || "Save failed")
      }

      const data = await response.json()
      onSaved(data.campaignId, data.shareUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save campaign")
    } finally {
      setSaving(false)
    }
  }, [assets, copy, brandColors, ctaSuggestions, optimizations, competitorIntel, onSaved])

  const handleCopyUrl = useCallback(async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea")
      textarea.value = shareUrl
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [shareUrl])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Save & Share</h2>
        <p className="text-zinc-400 text-sm">
          Save your campaign and share a link for stakeholder review and approval.
        </p>
      </div>

      {/* Summary */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-300">Campaign Summary</h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-zinc-500 text-xs">Brand</p>
            <p className="text-white font-medium">{copy.brandName}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs">Headline</p>
            <p className="text-white font-medium">{copy.headline}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs">CTA</p>
            <p className="text-white font-medium">{copy.cta}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs">Assets</p>
            <p className="text-white font-medium">
              {assets.imageUrls.length} image{assets.imageUrls.length !== 1 ? "s" : ""}
              {assets.videoUrl ? " + video" : ""}
            </p>
          </div>
        </div>

        {/* Asset previews */}
        <div className="flex gap-2 pt-2">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center p-1.5 overflow-hidden">
            <img src={assets.logoUrl} alt="Logo" className="w-full h-full object-contain" />
          </div>
          {assets.imageUrls.slice(0, 4).map((url, i) => (
            <div key={i} className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 overflow-hidden">
              <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        {/* What stakeholders will see */}
        <div className="pt-2 text-xs text-zinc-500">
          <p className="font-medium text-zinc-400 mb-1">Stakeholders will see:</p>
          <ul className="space-y-0.5 list-disc list-inside">
            <li>All 5 Edmunds ad format previews</li>
            <li>CTA score and AI suggestions</li>
            <li>Comment thread for feedback</li>
            <li>Approve button for sign-off</li>
          </ul>
        </div>
      </div>

      {/* Save / Share URL */}
      {shareUrl ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-emerald-400">
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
              <path d="M6 10l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm font-semibold text-emerald-400">Campaign saved!</p>
          </div>

          <div>
            <p className="text-xs text-zinc-500 mb-2">Share this link with stakeholders (expires in 30 days):</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 font-mono truncate">
                {shareUrl}
              </div>
              <button
                onClick={handleCopyUrl}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  copied
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-eds-50/20 text-eds-50 border border-eds-50/30 hover:bg-eds-50/30"
                }`}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
              saving
                ? "bg-zinc-800 text-zinc-500 cursor-wait"
                : "bg-eds-50 hover:bg-eds-60 text-white shadow-lg shadow-eds-50/20"
            }`}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                  <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Saving...
              </span>
            ) : (
              "Save Campaign & Generate Share Link"
            )}
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-start pt-4">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-200 border border-zinc-700 hover:border-zinc-500 transition-colors"
        >
          ← Back
        </button>
      </div>
    </div>
  )
}
