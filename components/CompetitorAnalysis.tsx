"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
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
}

export default function CompetitorAnalysis({
  brandDna,
  onContinue,
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
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
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
            {competitors.map((competitor, compIndex) => (
              <motion.div
                key={competitor.domain}
                className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl hover:border-white/20 transition-colors"
                variants={itemVariants}
              >
                {/* Competitor Header Card */}
                <div className="p-6 md:p-8 border-b border-white/5">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
                    {/* Avatar and Name */}
                    <div className="flex items-center gap-4">
                      <motion.div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold text-white/90"
                        style={{
                          background: competitor.logoColor,
                          boxShadow: `0 0 32px ${competitor.logoColor}40`,
                        }}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {competitor.name[0].toUpperCase()}
                      </motion.div>
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
                      <motion.div
                        className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-sm font-medium text-blue-200 flex items-center gap-2 whitespace-nowrap"
                        whileHover={{ scale: 1.05 }}
                      >
                        <TrendingUp size={16} />
                        <span>{competitor.adSpend} spent</span>
                      </motion.div>

                      {/* Top Platform Badge */}
                      <motion.div
                        className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-sm font-medium text-purple-200 whitespace-nowrap"
                        whileHover={{ scale: 1.05 }}
                      >
                        {competitor.topPlatform}
                      </motion.div>
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
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(competitor.ads || []).map((ad, adIndex) => (
                      <CompetitorAdCard
                        key={adIndex}
                        ad={ad}
                        competitor={competitor}
                        variants={cardHoverVariants}
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
                className="bg-gradient-to-br from-blue-600/20 to-blue-400/5 border border-blue-500/40 rounded-2xl p-6 backdrop-blur-xl"
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
                className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
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
                className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
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

        {/* Continue Button */}
        <motion.div
          className="px-6 sm:px-8 md:px-12 py-12 border-t border-white/5"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="max-w-6xl mx-auto flex justify-center">
            <motion.button
              onClick={onContinue}
              className="group relative px-8 py-4 rounded-lg font-semibold text-white text-lg flex items-center gap-3 overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {/* Button background with gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-100 group-hover:opacity-110 transition-opacity" />

              {/* Animated glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-300 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300" />

              {/* Button content */}
              <span className="relative z-10 flex items-center gap-2">
                See Your Strategic Edge
                <motion.span
                  className="inline-block"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight size={20} />
                </motion.span>
              </span>
            </motion.button>
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
}: {
  ad: CompetitorAd;
  competitor: CompetitorProfile;
  variants: any;
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
    <motion.div
      className="group bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors"
      variants={variants}
      initial="rest"
      whileHover="hover"
    >
      {/* Visual Mockup Area */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900">
        {/* Abstract visual using competitor's color and CSS gradients */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${competitor.logoColor}15 0%, ${competitor.logoColor}05 100%)`,
          }}
        />

        {/* Animated decorative elements */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, ${competitor.logoColor}40 0%, transparent 50%), radial-gradient(circle at 80% 70%, ${competitor.logoColor}30 0%, transparent 50%)`,
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />

        {/* Format Badge */}
        <div className="absolute top-3 right-3 z-10">
          <motion.div
            className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-xs font-bold text-white"
            whileHover={{ scale: 1.05 }}
          >
            {ad.format}
          </motion.div>
        </div>

        {/* Thumbnail description overlay on hover */}
        <motion.div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          whileHover={{ opacity: 1 }}
        >
          <p className="text-center text-sm text-white font-medium px-4">
            {ad.thumbnailDesc}
          </p>
        </motion.div>
      </div>

      {/* Content Area */}
      <div className="p-4 md:p-5">
        {/* Platform and Date */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            {ad.platform}
          </span>
          <span className="text-xs text-zinc-500">{ad.dateSpotted}</span>
        </div>

        {/* Headline */}
        <h4 className="font-bold text-white text-sm md:text-base mb-2 line-clamp-2">
          {ad.headline}
        </h4>

        {/* Body Text */}
        <p className="text-xs md:text-sm text-zinc-400 mb-4 line-clamp-2">
          {ad.bodyText}
        </p>

        {/* CTA */}
        <div className="mb-4 inline-block px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/80">
          {ad.cta}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-white/5">
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
        </div>

        {/* Sentiment Badge */}
        <div className="mb-3">
          <motion.div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold text-xs ${sentimentStyle.bg} border ${sentimentStyle.border} ${sentimentStyle.text}`}
            whileHover={{ scale: 1.05 }}
          >
            <span>{sentimentStyle.icon}</span>
            <span className="capitalize">
              {ad.sentiment} Sentiment
            </span>
          </motion.div>
        </div>

        {/* Why It Works Callout */}
        {ad.whyItWorks && (
          <motion.div
            className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs text-blue-200/90 italic"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="flex items-start gap-2">
              <span className="text-blue-400 font-bold mt-0.5">💡</span>
              <span>{ad.whyItWorks}</span>
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
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
