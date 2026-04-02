"use client";

import React, { useMemo } from "react";
import { BrandDNA, CompetitorProfile, CompetitorAd } from "@/lib/types";
import {
  TrendingUp,
  Heart,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface CompetitorAnalysisProps {
  brandDna: BrandDNA;
  onContinue: () => void;
}

export default function CompetitorAnalysis({
  brandDna,
  onContinue,
}: CompetitorAnalysisProps) {
  const competitors = brandDna.competitorProfiles || [];

  const competitorMetrics = useMemo(() => {
    const avgOverlap = competitors.length > 0
      ? competitors.reduce((sum, c) => sum + (c.audienceOverlap || 0), 0) / competitors.length
      : 0;
    const totalAds = competitors.reduce(
      (sum, c) => sum + (c.ads?.length || 0),
      0
    );
    return { avgOverlap, totalAds };
  }, [competitors]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-white">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-eds-40/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <div
          className="px-6 sm:px-8 md:px-12 py-12 md:py-16 border-b border-white/5 animate-[fade-in-up_0.5s_ease-out_both]"
        >
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              Competitive Landscape
            </h1>
            <div className="flex items-center gap-3 text-lg md:text-xl text-zinc-400">
              {brandDna.logoUrl && (
                <img src={brandDna.logoUrl} alt={brandDna.name} className="w-8 h-8 object-contain" />
              )}
              <span>{brandDna.name} vs. the competition</span>
            </div>
          </div>
        </div>

        {/* Competitor Sections */}
        <div className="px-6 sm:px-8 md:px-12 py-12">
          <div className="max-w-6xl mx-auto space-y-16">
            {competitors.length === 0 && (
              <div className="text-center py-20 animate-[fade-in_0.4s_ease-out_both]">
                <p className="text-zinc-400 text-lg">No competitor data available yet.</p>
                <p className="text-zinc-500 text-sm mt-2">You can still continue to the strategy phase.</p>
              </div>
            )}

            {competitors.map((competitor, compIndex) => (
              <div
                key={competitor.domain}
                className="bg-zinc-900/80 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors animate-[fade-in-up_0.5s_ease-out_both]"
                style={{ animationDelay: `${compIndex * 150}ms` }}
              >
                {/* Competitor Header Card */}
                <div className="p-6 md:p-8 border-b border-white/5">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
                    {/* Avatar and Name */}
                    <div className="flex items-center gap-4">
                      {competitor.logoUrl ? (
                        <div
                          className="w-16 h-16 rounded-full overflow-hidden bg-zinc-800 border border-white/10 flex items-center justify-center"
                          style={{ boxShadow: `0 0 32px ${competitor.logoColor}40` }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={competitor.logoUrl}
                            alt={`${competitor.name} logo`}
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                              const el = e.target as HTMLImageElement
                              const parent = el.parentElement
                              if (parent) {
                                parent.style.background = competitor.logoColor
                                parent.innerHTML = `<span class="text-white text-xl font-bold">${competitor.name[0].toUpperCase()}</span>`
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white/90"
                          style={{
                            background: competitor.logoColor,
                            boxShadow: `0 0 32px ${competitor.logoColor}40`,
                          }}
                        >
                          {competitor.name[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-white">
                          {competitor.name}
                        </h3>
                        <p className="text-sm text-zinc-400 font-mono">
                          {competitor.domain}
                        </p>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="w-full md:w-auto flex flex-wrap gap-3">
                      <div className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-sm font-medium text-blue-200 flex items-center gap-2 whitespace-nowrap">
                        <TrendingUp size={16} />
                        <span>{competitor.adSpend} spent</span>
                      </div>
                      <div className="px-4 py-2 rounded-full bg-eds-40/10 border border-eds-40/30 text-sm font-medium text-eds-80 whitespace-nowrap">
                        {competitor.topPlatform}
                      </div>
                    </div>
                  </div>

                  {/* Audience Overlap Visualization */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-zinc-300">
                        Audience Overlap
                      </span>
                      <span className="text-sm font-bold text-white">
                        {competitor.audienceOverlap}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 animate-[grow-width_0.8s_ease-out_0.3s_both]"
                        style={{ "--target-width": `${competitor.audienceOverlap}%` } as React.CSSProperties}
                      />
                    </div>
                  </div>

                  {/* Strengths and Weaknesses */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                        <CheckCircle size={16} />
                        Strengths
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {competitor.strengths.map((strength, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-xs font-medium text-emerald-200"
                          >
                            {strength}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-amber-300 mb-3 flex items-center gap-2">
                        <AlertCircle size={16} />
                        Weaknesses
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {competitor.weaknesses.map((weakness, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-xs font-medium text-amber-200"
                          >
                            {weakness}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Competitor Ads Grid */}
                <div className="p-6 md:p-8">
                  <h4 className="text-lg font-semibold text-white mb-6">
                    Recent Campaigns ({(competitor.ads || []).length})
                  </h4>
                  <div className={`grid gap-6 ${
                    (competitor.ads || []).length <= 2
                      ? "grid-cols-1"
                      : "md:grid-cols-2 lg:grid-cols-3"
                  }`}>
                    {(competitor.ads || []).map((ad, adIndex) => (
                      <CompetitorAdCard
                        key={adIndex}
                        ad={ad}
                        competitor={competitor}
                        horizontal={(competitor.ads || []).length <= 2}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Competitive Summary Section */}
        <div className="px-6 sm:px-8 md:px-12 py-12 animate-[fade-in-up_0.5s_ease-out_0.2s_both]">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8">
              Competitive Summary
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Your Brand Card */}
              <div className="bg-blue-950/60 border border-blue-500/40 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  {brandDna.name}
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Market Position</p>
                    <p className="text-sm font-medium text-blue-200">
                      Baseline for comparison
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Campaign Strategy</p>
                    <p className="text-sm font-medium text-blue-200">
                      {brandDna.voice.join(", ")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Market Overview
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Competitors Tracked</p>
                    <p className="text-2xl font-bold text-white">
                      {competitors.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Total Active Ads</p>
                    <p className="text-2xl font-bold text-white">
                      {competitorMetrics.totalAds}
                    </p>
                  </div>
                </div>
              </div>

              {/* Average Insights */}
              <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Audience Insights
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Avg Audience Overlap</p>
                    <p className="text-2xl font-bold text-white">
                      {Math.round(competitorMetrics.avgOverlap)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Opportunity</p>
                    <p className="text-sm font-medium text-cyan-200">
                      High differentiation potential
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue CTA */}
        <div className="px-6 sm:px-8 md:px-12 py-10 animate-[fade-in-up_0.5s_ease-out_0.3s_both]">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={onContinue}
              className="w-full py-4 font-semibold rounded-xl transition-all text-base text-white bg-eds-50 hover:bg-eds-60 hover:scale-[1.005] active:scale-[0.98]"
              style={{ boxShadow: "0 0 30px rgba(32, 112, 232, 0.25)" }}
            >
              See Your Strategic Edge →
            </button>
            <p className="text-center text-xs text-zinc-600 mt-3">
              Review the competitive landscape above before continuing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Competitor Ad Card ── */

function CompetitorAdCard({
  ad,
  competitor,
  horizontal = false,
}: {
  ad: CompetitorAd;
  competitor: CompetitorProfile;
  horizontal?: boolean;
}) {
  const sentimentConfig = {
    positive: { bg: "bg-emerald-500/10", border: "border-emerald-500/40", text: "text-emerald-200", icon: "✓" },
    neutral: { bg: "bg-amber-500/10", border: "border-amber-500/40", text: "text-amber-200", icon: "→" },
    negative: { bg: "bg-red-500/10", border: "border-red-500/40", text: "text-red-200", icon: "!" },
  };

  const sentimentStyle = sentimentConfig[ad.sentiment];

  return (
    <div
      className={`group bg-zinc-900/80 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ${
        horizontal ? "flex flex-col md:flex-row" : ""
      }`}
    >
      {/* Visual Mockup Area */}
      <div className={`relative overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 ${
        horizontal ? "h-48 md:h-auto md:w-80 flex-shrink-0" : "h-48"
      }`}>
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${competitor.logoColor}15 0%, ${competitor.logoColor}05 100%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, ${competitor.logoColor}40 0%, transparent 50%), radial-gradient(circle at 80% 70%, ${competitor.logoColor}30 0%, transparent 50%)`,
          }}
        />

        {/* Format Badge */}
        <div className="absolute top-3 right-3 z-10">
          <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-xs font-bold text-white">
            {ad.format}
          </div>
        </div>

        {/* Thumbnail description overlay on hover */}
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-center text-sm text-white font-medium px-4">
            {ad.thumbnailDesc}
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className={`p-4 md:p-5 ${horizontal ? "flex-1 min-w-0" : ""}`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            {ad.platform}
          </span>
          <span className="text-xs text-zinc-500">{ad.dateSpotted}</span>
        </div>

        <h4 className={`font-bold text-white mb-2 ${horizontal ? "text-base md:text-lg" : "text-sm md:text-base line-clamp-2"}`}>
          {ad.headline}
        </h4>

        <p className={`text-xs md:text-sm text-zinc-400 mb-4 ${horizontal ? "line-clamp-3" : "line-clamp-2"}`}>
          {ad.bodyText}
        </p>

        <div className="mb-4 inline-block px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/80">
          {ad.cta}
        </div>

        {/* Stats Row */}
        <div className={`grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-white/5 ${horizontal ? "md:grid-cols-3" : ""}`}>
          <div>
            <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
              <Eye size={14} />
              Impressions
            </p>
            <p className="text-sm font-semibold text-white">
              {ad.estimatedImpressions}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
              <Heart size={14} />
              Engagement
            </p>
            <p className="text-sm font-semibold text-white">
              {ad.engagementRate}%
            </p>
          </div>
          {horizontal && (
            <div>
              <p className="text-xs text-zinc-500 mb-1">Sentiment</p>
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-xs ${sentimentStyle.bg} border ${sentimentStyle.border} ${sentimentStyle.text}`}
              >
                <span>{sentimentStyle.icon}</span>
                <span className="capitalize">{ad.sentiment}</span>
              </div>
            </div>
          )}
        </div>

        {/* Sentiment Badge — vertical mode */}
        {!horizontal && (
          <div className="mb-3">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold text-xs ${sentimentStyle.bg} border ${sentimentStyle.border} ${sentimentStyle.text}`}
            >
              <span>{sentimentStyle.icon}</span>
              <span className="capitalize">{ad.sentiment} Sentiment</span>
            </div>
          </div>
        )}

        {ad.whyItWorks && (
          <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs text-blue-200/90 italic">
            <p className="flex items-start gap-2">
              <span className="text-blue-400 font-bold mt-0.5">💡</span>
              <span>{ad.whyItWorks}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Eye({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
