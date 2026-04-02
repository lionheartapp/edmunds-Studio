'use client';

import { Zap, Sparkles } from 'lucide-react';
import { StrategicEdge, Opportunity, PreBuiltCampaign } from '@/lib/types';

interface StrategicEdgeProps {
  edge: StrategicEdge;
  brandName: string;
  brandColors: {
    primary: string;
    accent: string;
  };
  onLaunchCampaign: () => void;
}

const categoryConfig: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  audience_gap: {
    label: 'Audience Gap',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/10',
  },
  format_gap: {
    label: 'Format Gap',
    color: 'from-eds-40 to-eds-30',
    bgColor: 'bg-eds-40/10',
  },
  platform_gap: {
    label: 'Platform Gap',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-500/10',
  },
  messaging_gap: {
    label: 'Messaging Gap',
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-500/10',
  },
  timing_gap: {
    label: 'Timing Gap',
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-500/10',
  },
  creative_gap: {
    label: 'Creative Gap',
    color: 'from-eds-50 to-eds-50',
    bgColor: 'bg-eds-50/10',
  },
};

const impactConfig: Record<string, { glow: string; badge: string }> = {
  high: {
    glow: 'shadow-lg shadow-red-500/50',
    badge: 'bg-red-500/20 text-red-300 border-red-500/30',
  },
  medium: {
    glow: 'shadow-lg shadow-amber-500/50',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  low: {
    glow: 'shadow-lg shadow-zinc-500/30',
    badge: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
  },
};

export default function StrategicEdgeComponent({
  edge,
  brandName,
  brandColors,
  onLaunchCampaign,
}: StrategicEdgeProps) {
  return (
    <div className="relative w-full bg-gradient-to-b from-zinc-950 to-zinc-900 text-white overflow-hidden">
      {/* Static background accents — no infinite animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.2), transparent)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.2), transparent)" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Header */}
        <div className="mb-16 text-center animate-[fade-in-up_0.5s_ease-out_both]">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
            Your Strategic Edge
          </h1>
          <p className="text-xl sm:text-2xl text-zinc-300">
            How {brandName} wins
          </p>
        </div>

        {/* Overall Strategy Card */}
        <div className="mb-16 animate-[fade-in-up_0.5s_ease-out_0.15s_both]">
          <div className="relative rounded-2xl border border-eds-50/20 bg-white/5 p-8 lg:p-10 overflow-hidden group">
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: "radial-gradient(circle at center, rgba(99,102,241,0.08), transparent)" }}
            />
            <div className="relative z-10">
              <h2 className="text-base font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                Overall Strategy
              </h2>
              <p className="text-2xl lg:text-3xl font-bold leading-relaxed text-white">
                {edge.overallStrategy}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Wins Section */}
        {edge.quickWins && edge.quickWins.length > 0 && (
          <div className="mb-20 animate-[fade-in-up_0.5s_ease-out_0.25s_both]">
            <h2 className="text-2xl font-bold mb-6 text-white">Quick Wins</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {edge.quickWins.map((win, index) => (
                <div
                  key={index}
                  className="group relative rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  style={{ animationDelay: `${300 + index * 100}ms` }}
                >
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-eds-50/25 to-eds-40/25">
                      <Zap className="w-6 h-6 text-yellow-300" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-zinc-400 mb-1">
                        Quick Win {index + 1}
                      </div>
                      <p className="text-white font-semibold text-sm lg:text-base leading-snug">
                        {win}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Opportunities Radar Section */}
        <div className="mb-20 animate-[fade-in-up_0.5s_ease-out_0.35s_both]">
          <h2 className="text-3xl font-bold mb-8 text-white">
            Opportunities Radar
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {edge.opportunities.map((opportunity, index) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                brandColors={brandColors}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Pre-Built Campaigns CTA Section */}
        {edge.preBuiltCampaigns && edge.preBuiltCampaigns.length > 0 && (
          <div
            className="relative rounded-3xl border border-white/10 overflow-hidden animate-[fade-in-up_0.5s_ease-out_0.45s_both]"
          >
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))" }}
            />

            {/* Gradient border effect */}
            <div
              className="absolute inset-0 rounded-3xl opacity-50 pointer-events-none"
              style={{ background: "conic-gradient(from 180deg, #2070E8, #4E91F5, #2070E8)" }}
            />

            <div className="relative z-10 px-8 lg:px-12 py-12 lg:py-16">
              <div className="max-w-3xl">
                <div className="mb-8">
                  <h3 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
                    We already built {edge.preBuiltCampaigns.length}{' '}
                    {edge.preBuiltCampaigns.length === 1 ? 'campaign' : 'campaigns'} based on these insights
                  </h3>
                  <p className="text-lg lg:text-xl text-zinc-300">
                    Ready to see what we've cooked up?
                  </p>
                </div>

                <button
                  onClick={onLaunchCampaign}
                  className="relative group mb-10 px-8 lg:px-10 py-4 lg:py-5 rounded-xl font-bold text-lg flex items-center gap-3 overflow-hidden transition-all duration-300 bg-gradient-to-r from-eds-50 to-eds-30 hover:scale-105 active:scale-[0.98]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Launch Your Campaign Dashboard
                    <span className="text-xl">→</span>
                  </span>
                </button>
              </div>

              {/* Campaign Preview Thumbnails */}
              <div className="relative h-24 lg:h-32 flex items-end gap-3 overflow-hidden">
                <p className="absolute top-0 left-0 text-xs text-zinc-400 uppercase tracking-wider mb-2">
                  Ready to deploy:
                </p>
                <div className="flex gap-3 pt-8">
                  {edge.preBuiltCampaigns.slice(0, 4).map((campaign, index) => (
                    <div
                      key={campaign.id}
                      className={`flex-shrink-0 w-20 h-20 lg:w-24 lg:h-24 rounded-lg border border-white/20 overflow-hidden hover:scale-105 transition-transform ${
                        index % 2 === 0
                          ? "bg-gradient-to-br from-eds-50/25 to-eds-40/15"
                          : "bg-gradient-to-br from-eds-40/25 to-eds-50/15"
                      }`}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-8 h-8 lg:w-10 lg:h-10 text-white/60" />
                      </div>
                    </div>
                  ))}
                  {edge.preBuiltCampaigns.length > 4 && (
                    <div className="flex-shrink-0 w-20 h-20 lg:w-24 lg:h-24 rounded-lg border border-white/20 bg-white/5 flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">
                        +{edge.preBuiltCampaigns.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OpportunityCard({
  opportunity,
  brandColors,
  index,
}: {
  opportunity: Opportunity;
  brandColors: { primary: string; accent: string };
  index: number;
}) {
  const config = categoryConfig[opportunity.category];
  const impact = impactConfig[opportunity.impact];

  return (
    <div
      className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 lg:p-8 overflow-hidden transition-all duration-300 hover:border-white/30 hover:-translate-y-1 animate-[fade-in-up_0.5s_ease-out_both]"
      style={{ animationDelay: `${400 + index * 100}ms` }}
    >
      {/* Hover glow effect */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none"
        style={{ background: "radial-gradient(circle at top-right, rgba(99,102,241,0.12), transparent)" }}
      />

      <div className="relative z-10 space-y-4">
        {/* Category and Impact Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${config.bgColor} text-white`}
            style={{
              background: `linear-gradient(135deg, ${config.color.split(' ')[0]}20, ${config.color.split(' ')[1]}10)`,
            }}
          >
            {config.label}
          </span>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${impact.badge}`}
          >
            {opportunity.impact.charAt(0).toUpperCase() + opportunity.impact.slice(1)} Impact
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl lg:text-2xl font-bold text-white">
          {opportunity.title}
        </h3>

        {/* Insight Text */}
        <p className="text-sm lg:text-base text-zinc-300 leading-relaxed">
          {opportunity.insight}
        </p>

        {/* Suggested Angle Callout */}
        <div className="rounded-lg border-l-4 border-eds-50/50 pl-4 py-3 italic text-zinc-200 bg-white/[0.03]">
          &ldquo;{opportunity.suggestedAngle}&rdquo;
        </div>

        {/* Platform Tags */}
        {opportunity.suggestedPlatforms && opportunity.suggestedPlatforms.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {opportunity.suggestedPlatforms.map((platform, idx) => (
              <span
                key={idx}
                className="text-xs px-3 py-1 rounded-full bg-zinc-800/50 text-zinc-300 border border-zinc-700/50"
              >
                {platform}
              </span>
            ))}
          </div>
        )}

        {/* Estimated Edge Highlight */}
        <div
          className={`rounded-lg px-4 py-3 font-bold text-white border-l-[3px] border-eds-50 ${impact.glow}`}
          style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))" }}
        >
          <span className="text-xs font-semibold text-zinc-400 block mb-1">
            ESTIMATED EDGE
          </span>
          <span className="text-base lg:text-lg">{opportunity.estimatedEdge}</span>
        </div>
      </div>
    </div>
  );
}
