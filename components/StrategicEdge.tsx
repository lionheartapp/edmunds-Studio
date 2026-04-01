'use client';

import { motion } from 'framer-motion';
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
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500/10',
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
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-500/10',
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
    transition: {
      duration: 0.6,
      ease: 'easeOut' as const,
    },
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
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20"
          style={{
            background: `radial-gradient(circle, ${brandColors.primary}33, transparent)`,
          }}
          animate={{ y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-15"
          style={{
            background: `radial-gradient(circle, ${brandColors.accent}33, transparent)`,
          }}
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            Your Strategic Edge
          </motion.h1>
          <motion.p
            className="text-xl sm:text-2xl text-zinc-300"
            variants={itemVariants}
          >
            How {brandName} wins
          </motion.p>
        </motion.div>

        {/* Overall Strategy Card */}
        <motion.div
          className="mb-16"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <div
            className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 lg:p-10 overflow-hidden group"
            style={{
              borderColor: `${brandColors.primary}40`,
              background: `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(${brandColors.primary},0.03) 100%)`,
            }}
          >
            <motion.div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `radial-gradient(circle at center, ${brandColors.primary}15, transparent)`,
              }}
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
        </motion.div>

        {/* Quick Wins Section */}
        {edge.quickWins && edge.quickWins.length > 0 && (
          <motion.div
            className="mb-20"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-white">Quick Wins</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {edge.quickWins.map((win, index) => (
                <motion.div
                  key={index}
                  className="group relative rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm p-6 hover:border-white/20 transition-all duration-300 overflow-hidden"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 flex items-start gap-4">
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${brandColors.primary}40, ${brandColors.accent}40)`,
                      }}
                    >
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
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Opportunities Radar Section */}
        <motion.div
          className="mb-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-8 text-white">
            Opportunities Radar
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {edge.opportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                brandColors={brandColors}
              />
            ))}
          </div>
        </motion.div>

        {/* Pre-Built Campaigns CTA Section */}
        {edge.preBuiltCampaigns && edge.preBuiltCampaigns.length > 0 && (
          <motion.div
            className="relative rounded-3xl border border-white/10 overflow-hidden"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.7 }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${brandColors.primary}15, ${brandColors.accent}10)`,
              }}
            />
            <div className="absolute inset-0 backdrop-blur-md" />

            {/* Gradient border effect */}
            <div
              className="absolute inset-0 rounded-3xl opacity-50 pointer-events-none"
              style={{
                background: `conic-gradient(from 180deg, ${brandColors.primary}, ${brandColors.accent}, ${brandColors.primary})`,
              }}
            />

            <div className="relative z-10 px-8 lg:px-12 py-12 lg:py-16">
              <div className="max-w-3xl">
                <motion.div
                  className="mb-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.h3
                    className="text-3xl lg:text-4xl font-bold mb-4 text-white"
                    variants={itemVariants}
                  >
                    We already built {edge.preBuiltCampaigns.length}{' '}
                    {edge.preBuiltCampaigns.length === 1 ? 'campaign' : 'campaigns'} based on these insights
                  </motion.h3>
                  <motion.p
                    className="text-lg lg:text-xl text-zinc-300"
                    variants={itemVariants}
                  >
                    Ready to see what we've cooked up?
                  </motion.p>
                </motion.div>

                <motion.button
                  onClick={onLaunchCampaign}
                  className="relative group mb-10 px-8 lg:px-10 py-4 lg:py-5 rounded-xl font-bold text-lg flex items-center gap-3 overflow-hidden transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.accent})`,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  variants={itemVariants}
                >
                  {/* Pulsing glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(circle, ${brandColors.primary}80, transparent)`,
                    }}
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    Launch Your Campaign Dashboard
                    <span className="text-xl">→</span>
                  </span>
                </motion.button>
              </div>

              {/* Campaign Preview Thumbnails */}
              <div className="relative h-24 lg:h-32 flex items-end gap-3 overflow-hidden">
                <p className="absolute top-0 left-0 text-xs text-zinc-400 uppercase tracking-wider mb-2">
                  Ready to deploy:
                </p>
                <motion.div
                  className="flex gap-3 pt-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.8 }}
                >
                  {edge.preBuiltCampaigns.slice(0, 4).map((campaign, index) => (
                    <motion.div
                      key={campaign.id}
                      className="flex-shrink-0 w-20 h-20 lg:w-24 lg:h-24 rounded-lg border border-white/20 overflow-hidden"
                      variants={itemVariants}
                      whileHover={{
                        scale: 1.1,
                        zIndex: 10,
                      }}
                      style={{
                        background: `linear-gradient(135deg, ${
                          index % 2 === 0 ? brandColors.primary : brandColors.accent
                        }40, ${
                          index % 2 === 0 ? brandColors.accent : brandColors.primary
                        }20)`,
                      }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-8 h-8 lg:w-10 lg:h-10 text-white/60" />
                      </div>
                    </motion.div>
                  ))}
                  {edge.preBuiltCampaigns.length > 4 && (
                    <motion.div
                      className="flex-shrink-0 w-20 h-20 lg:w-24 lg:h-24 rounded-lg border border-white/20 bg-white/5 flex items-center justify-center"
                      variants={itemVariants}
                    >
                      <span className="text-sm font-semibold text-white">
                        +{edge.preBuiltCampaigns.length - 4}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Opportunity Card Component
function OpportunityCard({
  opportunity,
  brandColors,
}: {
  opportunity: Opportunity;
  brandColors: { primary: string; accent: string };
}) {
  const config = categoryConfig[opportunity.category];
  const impact = impactConfig[opportunity.impact];

  return (
    <motion.div
      className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 lg:p-8 overflow-hidden transition-all duration-300 hover:border-white/30"
      variants={itemVariants}
      whileHover={{
        scale: 1.02,
        y: -4,
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Hover glow effect */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at top-right, ${brandColors.primary}20, transparent)`,
        }}
      />

      {/* Border brightening on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        initial={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
        whileHover={{
          borderColor: `${brandColors.primary}60`,
        }}
        transition={{ duration: 0.3 }}
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
        <div
          className="rounded-lg border-l-4 pl-4 py-3 italic text-zinc-200 bg-white/[0.03]"
          style={{
            borderLeftColor: `${brandColors.primary}80`,
          }}
        >
          "{opportunity.suggestedAngle}"
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
          className={`rounded-lg px-4 py-3 font-bold text-white ${impact.glow}`}
          style={{
            background: `linear-gradient(135deg, ${brandColors.primary}15, ${brandColors.accent}10)`,
            borderLeft: `3px solid ${brandColors.primary}`,
          }}
        >
          <span className="text-xs font-semibold text-zinc-400 block mb-1">
            ESTIMATED EDGE
          </span>
          <span className="text-base lg:text-lg">{opportunity.estimatedEdge}</span>
        </div>
      </div>
    </motion.div>
  );
}
