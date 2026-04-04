"use client"

import { useState } from "react"
import type { OemAssets, OemCopy, BrandColors, EdmundsAdFormat } from "@/lib/oem-types"
import { AD_FORMAT_DIMENSIONS } from "@/lib/oem-types"

interface AdPreviewGridProps {
  assets: OemAssets
  copy: OemCopy
  brandColors?: BrandColors
}

// ─── External Link Icon ─────────────────────────────────────

const ExternalLinkIcon = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block ml-1">
    <path d="M5 1h6v6M11 1L5 7" />
  </svg>
)

// ─── Ad Badge ────────���──────────────────────────────────────

const AdBadge = ({ className = "" }: { className?: string }) => (
  <span className={`absolute top-1.5 right-1.5 text-[8px] font-bold tracking-wider uppercase bg-black/60 text-zinc-400 px-1.5 py-0.5 rounded ${className}`}>
    Ad
  </span>
)

// ─── MREC Preview (300×250) ─────────────────────────────────

function MrecPreview({ assets, copy }: { assets: OemAssets; copy: OemCopy }) {
  return (
    <div className="relative bg-zinc-900 overflow-hidden" style={{ width: 300, height: 250 }}>
      <AdBadge />
      {/* Logo top-left */}
      <div className="absolute top-3 left-3 w-16 h-8">
        <img src={assets.logoUrl} alt={copy.brandName} className="w-full h-full object-contain object-left" />
      </div>
      {/* Vehicle image center */}
      <div className="absolute top-10 left-0 right-0 flex items-center justify-center" style={{ height: 130 }}>
        {assets.imageUrls[0] && (
          <img src={assets.imageUrls[0]} alt="Vehicle" className="max-w-[280px] max-h-[130px] object-contain" />
        )}
      </div>
      {/* Headline below image */}
      <div className="absolute bottom-12 left-3 right-3">
        <p className="text-white text-sm font-semibold leading-tight line-clamp-2">{copy.headline}</p>
      </div>
      {/* CTA link */}
      <div className="absolute bottom-3 left-3">
        <span className="text-[#4E91F5] text-xs font-medium hover:underline cursor-pointer">
          {copy.cta}<ExternalLinkIcon />
        </span>
      </div>
    </div>
  )
}

// ─── Spotlight Preview (300×90) ─────────────────────────────

function SpotlightPreview({ assets, copy }: { assets: OemAssets; copy: OemCopy }) {
  return (
    <div className="relative bg-zinc-900 flex items-center overflow-hidden" style={{ width: 300, height: 90 }}>
      <AdBadge />
      {/* Vehicle image left */}
      <div className="flex-shrink-0 w-24 h-full flex items-center justify-center p-1">
        {assets.imageUrls[0] && (
          <img src={assets.imageUrls[0]} alt="Vehicle" className="max-w-full max-h-full object-contain" />
        )}
      </div>
      {/* Headline + CTA center */}
      <div className="flex-1 px-2 min-w-0">
        <p className="text-white text-[11px] font-semibold leading-tight line-clamp-2">{copy.headline}</p>
        <span className="text-[#4E91F5] text-[10px] font-medium mt-1 inline-block">
          {copy.cta}<ExternalLinkIcon />
        </span>
      </div>
      {/* Logo right */}
      <div className="flex-shrink-0 w-14 h-full flex items-center justify-center p-1.5">
        <img src={assets.logoUrl} alt={copy.brandName} className="max-w-full max-h-8 object-contain" />
      </div>
    </div>
  )
}

// ─── Leaderboard Preview (728×90) ───────────────────────────

function LeaderboardPreview({ assets, copy }: { assets: OemAssets; copy: OemCopy }) {
  return (
    <div className="relative bg-zinc-900 flex items-center overflow-hidden" style={{ width: 728, height: 90 }}>
      <AdBadge />
      {/* Logo left */}
      <div className="flex-shrink-0 w-20 h-full flex items-center justify-center p-2">
        <img src={assets.logoUrl} alt={copy.brandName} className="max-w-full max-h-10 object-contain" />
      </div>
      {/* Headline */}
      <div className="flex-1 px-4 min-w-0">
        <p className="text-white text-sm font-semibold leading-tight">{copy.headline}</p>
        <p className="text-zinc-400 text-[11px] mt-1 line-clamp-1">{copy.bodyText}</p>
      </div>
      {/* Vehicle image center */}
      <div className="flex-shrink-0 w-40 h-full flex items-center justify-center p-1">
        {assets.imageUrls[0] && (
          <img src={assets.imageUrls[0]} alt="Vehicle" className="max-w-full max-h-full object-contain" />
        )}
      </div>
      {/* CTA right */}
      <div className="flex-shrink-0 px-4">
        <span className="text-[#4E91F5] text-xs font-medium whitespace-nowrap">
          {copy.cta}<ExternalLinkIcon />
        </span>
      </div>
    </div>
  )
}

// ─── Mobile Adhesion Preview (320×50) ───────────────────────

function MobileAdhesionPreview({ assets, copy }: { assets: OemAssets; copy: OemCopy }) {
  return (
    <div className="relative bg-zinc-900 flex items-center overflow-hidden" style={{ width: 320, height: 50 }}>
      <AdBadge className="!top-0.5 !right-0.5 !text-[6px] !px-1 !py-0" />
      {/* Vehicle image left */}
      <div className="flex-shrink-0 w-14 h-full flex items-center justify-center p-0.5">
        {assets.imageUrls[0] && (
          <img src={assets.imageUrls[0]} alt="Vehicle" className="max-w-full max-h-full object-contain" />
        )}
      </div>
      {/* Headline + CTA center */}
      <div className="flex-1 px-2 min-w-0">
        <p className="text-white text-[10px] font-semibold leading-tight line-clamp-1">{copy.headline}</p>
        <span className="text-[#4E91F5] text-[9px] font-medium">
          {copy.cta}<ExternalLinkIcon />
        </span>
      </div>
      {/* Logo right */}
      <div className="flex-shrink-0 w-10 h-full flex items-center justify-center p-1">
        <img src={assets.logoUrl} alt={copy.brandName} className="max-w-full max-h-6 object-contain" />
      </div>
    </div>
  )
}

// ─── Adhesion Preview (1200×100) ────────────────────────────

function AdhesionPreview({ assets, copy }: { assets: OemAssets; copy: OemCopy }) {
  return (
    <div className="relative bg-zinc-900 flex items-center overflow-hidden" style={{ width: 1200, height: 100 }}>
      <AdBadge />
      {/* Logo left */}
      <div className="flex-shrink-0 w-24 h-full flex items-center justify-center p-3">
        <img src={assets.logoUrl} alt={copy.brandName} className="max-w-full max-h-12 object-contain" />
      </div>
      {/* Headline */}
      <div className="flex-shrink-0 w-52 px-4">
        <p className="text-white text-sm font-semibold leading-tight">{copy.headline}</p>
      </div>
      {/* Vehicle image */}
      <div className="flex-shrink-0 w-48 h-full flex items-center justify-center p-1">
        {assets.imageUrls[0] && (
          <img src={assets.imageUrls[0]} alt="Vehicle" className="max-w-full max-h-full object-contain" />
        )}
      </div>
      {/* Body text */}
      <div className="flex-1 px-4 min-w-0">
        <p className="text-zinc-300 text-xs leading-relaxed line-clamp-3">{copy.bodyText}</p>
      </div>
      {/* CTA */}
      <div className="flex-shrink-0 px-6">
        <span className="text-[#4E91F5] text-sm font-medium whitespace-nowrap">
          {copy.cta}<ExternalLinkIcon />
        </span>
      </div>
    </div>
  )
}

// ─── Format Map ─────────────────────────────────────────────

const FORMAT_COMPONENTS: Record<EdmundsAdFormat, React.FC<{ assets: OemAssets; copy: OemCopy }>> = {
  mrec: MrecPreview,
  spotlight: SpotlightPreview,
  leaderboard: LeaderboardPreview,
  mobile_adhesion: MobileAdhesionPreview,
  adhesion: AdhesionPreview,
}

const FORMAT_ORDER: EdmundsAdFormat[] = ["leaderboard", "mrec", "spotlight", "mobile_adhesion", "adhesion"]

// ─── Main Grid ────��─────────────────────────────────────────

export default function AdPreviewGrid({ assets, copy, brandColors }: AdPreviewGridProps) {
  const [expandedFormat, setExpandedFormat] = useState<EdmundsAdFormat | null>(null)

  return (
    <>
      <div className="space-y-8">
        {FORMAT_ORDER.map((format) => {
          const Component = FORMAT_COMPONENTS[format]
          const dims = AD_FORMAT_DIMENSIONS[format]

          return (
            <div key={format} className="space-y-2">
              <div className="flex items-baseline gap-2">
                <h3 className="text-sm font-semibold text-zinc-300">{dims.label}</h3>
                <span className="text-xs text-zinc-600">{dims.width}×{dims.height}</span>
              </div>
              <div
                className="inline-block rounded-lg border border-zinc-800 overflow-hidden cursor-pointer hover:border-zinc-600 transition-colors"
                onClick={() => setExpandedFormat(format)}
                style={format === "adhesion" ? { maxWidth: "100%", overflowX: "auto" } : undefined}
              >
                <Component assets={assets} copy={copy} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Expanded Modal */}
      {expandedFormat && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setExpandedFormat(null)}
        >
          <div
            className="relative max-w-[95vw] max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setExpandedFormat(null)}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-zinc-800 border border-zinc-600 text-zinc-300 flex items-center justify-center hover:bg-zinc-700 transition-colors"
            >
              ×
            </button>
            <div className="rounded-lg border border-zinc-700 overflow-hidden">
              {(() => {
                const Component = FORMAT_COMPONENTS[expandedFormat]
                return <Component assets={assets} copy={copy} />
              })()}
            </div>
            <p className="text-center text-xs text-zinc-500 mt-3">
              {AD_FORMAT_DIMENSIONS[expandedFormat].label} — {AD_FORMAT_DIMENSIONS[expandedFormat].width}×{AD_FORMAT_DIMENSIONS[expandedFormat].height}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
