"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrandDNA, CompetitorProfile, CompetitorAd } from "@/lib/types";
import {
  TrendingUp,
  Share2,
  MessageSquare,
  Heart,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

interface CompetitorAnalysisProps {
  brandDna: BrandDNA;
  onContinue: () => void;
  isLoadingCompetitors?: boolean;
}

export default function CompetitorAnalysis({
  brandDna,
  onContinue,
  isLoadingCompetitors = false,
}: CompetitorAnalysisProps) {
  const competitors = brandDna.competitorProfiles || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  const cardHoverVariants = {
    rest: { y: 0, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" },
    hover: {
      y: -8,
      boxShadow: "0 20px 25px rgba(0, 0, 0, 0.3)",
      transition: { duration: 0.3, ease: "easeOut" as const },
    },
  };

  // Calculate metrics for competitive summary
  const competitorMetrics = useMemo(() => {
    const avgOverlap = competitors.length > 0
      ? competitors.reduce((sum, c) => sum + (c.audienceOverlap || 0), 0) / competitors.length
      : 0;
    const totalAdSpend = competitors.length;
    const totalAds = competitors.reduce(
      (sum, c) => sum + (c.ads?.length || 0),
      0
    );

    return { avgOverlap, totalAdSpend, totalAds };
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
        <motion.div
          className="px-6 sm:px-8 md:px-12 py-12 md:py-16 border-b border-white/5"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent"
              variants={itemVariants}
            >
              Competitive Landscape
            </motion.h1>
            <motion.div
              className="flex items-center gap-3 text-lg md:text-xl text-zinc-400"
              variants={itemVariants}
            >
              {brandDna.logoUrl && (
                <img src={brandDna.logoUrl} alt={brandDna.name} className="w-8 h-8 object-contain" />
              )}
              <span>{brandDna.name} vs. the competition</span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Competitor Sections */}
        <motion.div
          className="px-6 sm:px-8 md:px-12 py-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="max-w-6xl mx-auto space-y-16">
            {/* Loading state while competitor profiles are fetched */}
            {isLoadingCompetitors && competitors.length === 0 && (
              <CompetitorLoader />
            )}

            {!isLoadingCompetitors && competitors.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <p className="text-zinc-400 text-lg">No competitor data available yet.</p>
                <p className="text-zinc-500 text-sm mt-2">You can still continue to the strategy phase.</p>
              </motion.div>
            )}

            {competitors.map((competitor, compIndex) => (
              <motion.div
                key={competitor.domain}
                className="bg-zinc-900/80 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors cursor-pointer"
                variants={itemVariants}
              >
                {/* Competitor Header Card */}
                <div className="p-6 md:p-8 border-b border-white/5">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
                    {/* Avatar and Name */}
                    <div className="flex items-center gap-4">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold text-white/90 hover:scale-110 transition-transform duration-300"
                        style={{
                          background: competitor.logoColor,
                          boxShadow: `0 0 32px ${competitor.logoColor}40`,
                        }}
                      >
                        {competitor.name[0].toUpperCase()}
                      </div>
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
                      {/* Ad Spend Badge */}
                      <div
                        className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-sm font-medium text-blue-200 flex items-center gap-2 whitespace-nowrap hover:scale-105 transition-transform"
                      >
                        <TrendingUp size={16} />
                        <span>{competitor.adSpend} spent</span>
                      </div>

                      {/* Top Platform Badge */}
                      <div
                        className="px-4 py-2 rounded-full bg-eds-40/10 border border-eds-40/30 text-sm font-medium text-eds-80 whitespace-nowrap hover:scale-105 transition-transform"
                      >
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
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${competitor.audienceOverlap}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" as const }}
                      />
                    </div>
                  </div>

                  {/* Strengths and Weaknesses */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                        <CheckCircle size={16} />
                        Strengths
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {competitor.strengths.map((strength, idx) => (
                          <motion.div
                            key={idx}
                            className="px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-xs font-medium text-emerald-200"
                            variants={itemVariants}
                          >
                            {strength}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Weaknesses */}
                    <div>
                      <h4 className="text-sm font-semibold text-amber-300 mb-3 flex items-center gap-2">
                        <AlertCircle size={16} />
                        Weaknesses
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {competitor.weaknesses.map((weakness, idx) => (
                          <motion.div
                            key={idx}
                            className="px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-xs font-medium text-amber-200"
                            variants={itemVariants}
                          >
                            {weakness}
                          </motion.div>
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
                        variants={cardHoverVariants}
                        horizontal={(competitor.ads || []).length <= 2}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Competitive Summary Section */}
        <motion.div
          className="px-6 sm:px-8 md:px-12 py-12"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8">
              Competitive Summary
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Your Brand Card */}
              <motion.div
                className="bg-blue-950/60 border border-blue-500/40 rounded-2xl p-6"
                variants={itemVariants}
              >
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
                    <p className="text-xs text-zinc-400 mb-1">
                      Campaign Strategy
                    </p>
                    <p className="text-sm font-medium text-blue-200">
                      {brandDna.voice.join(", ")}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Key Metrics */}
              <motion.div
                className="bg-zinc-900/80 border border-white/10 rounded-2xl p-6"
                variants={itemVariants}
              >
                <h3 className="text-lg font-bold text-white mb-4">
                  Market Overview
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">
                      Competitors Tracked
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {competitors.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">
                      Total Active Ads
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {competitorMetrics.totalAds}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Average Insights */}
              <motion.div
                className="bg-zinc-900/80 border border-white/10 rounded-2xl p-6"
                variants={itemVariants}
              >
                <h3 className="text-lg font-bold text-white mb-4">
                  Audience Insights
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">
                      Avg Audience Overlap
                    </p>
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
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Sticky Continue CTA */}
        <motion.div
          className="sticky bottom-0 z-30 px-6 sm:px-8 md:px-12 py-5 border-t border-white/5 bg-zinc-950/95"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="max-w-6xl mx-auto flex justify-center">
            <button
              onClick={onContinue}
              className="group relative px-8 py-4 rounded-lg font-semibold text-white text-lg flex items-center gap-3 overflow-hidden hover:scale-105 active:scale-[0.98] transition-transform duration-200"
            >
              {/* Button background with gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-100 group-hover:opacity-110 transition-opacity" />

              {/* Animated glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-300 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300" />

              {/* Button content */}
              <span className="relative z-10 flex items-center gap-2">
                See Your Strategic Edge
                <span className="inline-block animate-nudge-right">
                  <ArrowRight size={20} />
                </span>
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Competitor Ad Card Component
function CompetitorAdCard({
  ad,
  competitor,
  variants,
  horizontal = false,
}: {
  ad: CompetitorAd;
  competitor: CompetitorProfile;
  variants: any;
  horizontal?: boolean;
}) {
  const sentimentConfig = {
    positive: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/40",
      text: "text-emerald-200",
      icon: "✓",
    },
    neutral: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/40",
      text: "text-amber-200",
      icon: "→",
    },
    negative: {
      bg: "bg-red-500/10",
      border: "border-red-500/40",
      text: "text-red-200",
      icon: "!",
    },
  };

  const sentimentStyle = sentimentConfig[ad.sentiment];

  return (
    <div
      className={`group bg-zinc-900/80 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 ${
        horizontal ? "flex flex-col md:flex-row" : ""
      }`}
    >
      {/* Visual Mockup Area */}
      <div className={`relative overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 ${
        horizontal ? "h-48 md:h-auto md:w-80 flex-shrink-0" : "h-48"
      }`}>
        {/* Abstract visual using competitor's color and CSS gradients */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${competitor.logoColor}15 0%, ${competitor.logoColor}05 100%)`,
          }}
        />

        {/* Static decorative elements — no infinite JS animation */}
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
        {/* Platform and Date */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            {ad.platform}
          </span>
          <span className="text-xs text-zinc-500">{ad.dateSpotted}</span>
        </div>

        {/* Headline */}
        <h4 className={`font-bold text-white mb-2 ${horizontal ? "text-base md:text-lg" : "text-sm md:text-base line-clamp-2"}`}>
          {ad.headline}
        </h4>

        {/* Body Text */}
        <p className={`text-xs md:text-sm text-zinc-400 mb-4 ${horizontal ? "line-clamp-3" : "line-clamp-2"}`}>
          {ad.bodyText}
        </p>

        {/* CTA */}
        <div className="mb-4 inline-block px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/80">
          {ad.cta}
        </div>

        {/* Stats Row */}
        <div className={`grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-white/5 ${horizontal ? "md:grid-cols-3" : ""}`}>
          {/* Impressions */}
          <div>
            <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
              <Eye size={14} />
              Impressions
            </p>
            <p className="text-sm font-semibold text-white">
              {ad.estimatedImpressions}
            </p>
          </div>

          {/* Engagement Rate */}
          <div>
            <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
              <Heart size={14} />
              Engagement
            </p>
            <p className="text-sm font-semibold text-white">
              {ad.engagementRate}%
            </p>
          </div>

          {/* Sentiment — inline in horizontal mode */}
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

        {/* Sentiment Badge — only in vertical mode */}
        {!horizontal && (
          <div className="mb-3">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold text-xs ${sentimentStyle.bg} border ${sentimentStyle.border} ${sentimentStyle.text}`}
            >
              <span>{sentimentStyle.icon}</span>
              <span className="capitalize">
                {ad.sentiment} Sentiment
              </span>
            </div>
          </div>
        )}

        {/* Why It Works Callout */}
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

// Icon component (Eye icon used in stats)
function Eye({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/* ── Competitor Loader — blob with playful messages ── */

const COMPETITOR_MESSAGES = [
  "Sizing up the competition...",
  "Reading their ad copy so you don't have to...",
  "Calculating audience overlap with scary precision...",
  "Finding where they're spending and where they're not...",
  "Reverse-engineering their ad strategy...",
  "Judging their creative choices (objectively, of course)...",
  "Pulling market share data from the vault...",
  "Comparing apples to slightly different apples...",
];

function CompetitorLoader() {
  const [msgIndex, setMsgIndex] = useState(() => Math.floor(Math.random() * COMPETITOR_MESSAGES.length));

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (interval) return;
      interval = setInterval(() => {
        setMsgIndex(prev => (prev + 1) % COMPETITOR_MESSAGES.length);
      }, 3000);
    };

    const onVisChange = () => {
      if (document.hidden) {
        if (interval) { clearInterval(interval); interval = null; }
      } else {
        start();
      }
    };

    start();
    document.addEventListener("visibilitychange", onVisChange);
    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisChange);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center py-24"
    >
      {/* Animated blob — CSS animations (zero JS thread usage) */}
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-[-6px] bg-eds-50/20 blur-md animate-blob-glow" />
        <div className="absolute inset-0 bg-eds-50/25 animate-blob-morph" />
        <div className="absolute inset-2 rounded-full border-2 border-eds-60/30 border-t-eds-60/80 animate-spin-slow" />
        {/* Crosshair / target icon */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
          </svg>
        </div>
      </div>

      <p className="text-lg font-semibold text-zinc-200 mb-3">Competitive Landscape</p>
      <div className="h-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-zinc-500 text-center"
          >
            {COMPETITOR_MESSAGES[msgIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
