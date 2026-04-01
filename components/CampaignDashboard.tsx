'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrandDNA, StrategicEdge, PreBuiltCampaign } from '@/lib/types';
import { ChevronDown, Plus, Zap, Target, TrendingUp, Lock } from 'lucide-react';

interface CampaignDashboardProps {
  brandDna: BrandDNA;
  edge: StrategicEdge;
  showDrawerOnMount?: boolean;
  onPlaceOnEdmunds?: (campaign: PreBuiltCampaign) => void;
}

export default function CampaignDashboard({
  brandDna,
  edge,
  showDrawerOnMount = false,
  onPlaceOnEdmunds,
}: CampaignDashboardProps) {
  const [drawerOpen, setDrawerOpen] = useState(showDrawerOnMount);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  const campaigns = edge.preBuiltCampaigns || [];
  const opportunitiesCount = campaigns.length;
  const estimatedReach = campaigns.length * 50000; // Placeholder calculation
  const competitorGaps = Math.max(0, 5 - opportunitiesCount);

  // Generate gradient for each campaign — consistent UI palette
  const getGradientForCampaign = (index: number) => {
    const gradients = [
      "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.18) 100%)",
      "linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(99,102,241,0.18) 100%)",
      "linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(236,72,153,0.12) 100%)",
      "linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(99,102,241,0.18) 100%)",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white overflow-hidden">
      {/* Top Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="sticky top-0 z-40 border-b border-zinc-800/50 backdrop-blur-xl bg-zinc-950/80"
      >
        <div className="flex items-center justify-between px-6 py-4">
          {/* Brand Section */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <motion.div
                className="w-4 h-4 rounded-full bg-eds-50"
                animate={{ boxShadow: "0 0 20px rgba(99,102,241,0.5)" }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <h1 className="font-bold text-lg">{brandDna.name}</h1>
            </div>
          </div>

          {/* Center Title */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-white via-blue-200 to-eds-80 bg-clip-text text-transparent">
              Campaign Dashboard
            </h2>
          </div>

          {/* New Campaign Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all bg-eds-50"
            style={{ boxShadow: "0 0 20px rgba(99,102,241,0.25)" }}
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {[
          {
            label: 'Pre-built Campaigns',
            value: campaigns.length,
            icon: Zap,
            color: '#2070E8',
            isEstimate: false,
          },
          {
            label: 'Opportunities Found',
            value: opportunitiesCount,
            icon: Target,
            color: '#8B5CF6',
            isEstimate: false,
          },
          {
            label: 'Estimated Reach',
            value: `${(estimatedReach / 1000).toFixed(0)}K`,
            icon: TrendingUp,
            color: '#06B6D4',
            isEstimate: true,
          },
          {
            label: 'Competitor Gaps',
            value: competitorGaps,
            icon: Lock,
            color: '#EC4899',
            isEstimate: false,
          },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 + idx * 0.1 }}
              className="relative overflow-hidden rounded-xl border border-zinc-800/50 backdrop-blur-xl bg-zinc-900/50 p-6 group hover:border-zinc-700/50 transition-all"
            >
              {/* Animated background gradient */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                style={{ background: stat.color }}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-zinc-400 text-sm font-medium">{stat.label}</p>
                  <Icon
                    className="w-5 h-5"
                    style={{ color: stat.color }}
                  />
                </div>
                <p className={`text-3xl font-bold ${stat.isEstimate ? 'text-zinc-300' : ''}`}>
                  {stat.value}
                  {stat.isEstimate && <span className="text-xs font-normal text-zinc-500 ml-2">est.</span>}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Campaign Grid Preview (visible behind drawer when closed) */}
      <motion.div
        animate={{ opacity: drawerOpen ? 0.5 : 1 }}
        transition={{ duration: 0.3 }}
        className="px-6 pb-12"
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Your Campaigns</h3>
          {campaigns.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-dashed border-zinc-700 backdrop-blur-xl bg-zinc-900/30 p-12 text-center"
            >
              <div className="mb-3">
                <Zap className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
              </div>
              <p className="text-zinc-400">
                Click "New Campaign" or "View Campaigns" to get started
              </p>
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setDrawerOpen(true)}
              className="w-full text-left"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border border-zinc-800/50 backdrop-blur-xl bg-gradient-to-br from-zinc-900/80 to-zinc-800/40 p-6 hover:border-zinc-700/50 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold mb-1">
                      {campaigns.length} AI-Generated Campaign{campaigns.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-zinc-400">
                      Ready to review and customize
                    </p>
                  </div>
                  <ChevronDown className="w-5 h-5 text-zinc-400" />
                </div>
              </motion.div>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Backdrop Overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Slide-Up Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            key="drawer"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
              mass: 0.8,
            }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-hidden rounded-t-3xl border-t border-zinc-800/50 bg-zinc-900/95 backdrop-blur-xl"
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <motion.div
                drag="y"
                dragElastic={0.2}
                dragMomentum={false}
                onDragEnd={(_, { offset, velocity }) => {
                  if (offset.y > 100 || velocity.y > 500) {
                    setDrawerOpen(false);
                  }
                }}
                className="w-12 h-1 rounded-full bg-zinc-700 cursor-grab active:cursor-grabbing hover:bg-zinc-600 transition-colors"
              />
            </div>

            {/* Drawer Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-2rem)]">
              {/* Drawer Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="sticky top-0 z-10 px-6 py-4 border-b border-zinc-800/50 bg-zinc-900/95 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      Your AI-Generated Campaigns
                    </h2>
                    <p className="text-sm text-zinc-400 mt-1">
                      {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} ready to launch
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDrawerOpen(false)}
                    aria-label="Close drawer"
                    className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Campaign Cards Grid */}
              <div className="px-6 py-8">
                {campaigns.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <p className="text-zinc-400">
                      No campaigns generated yet. Go back and complete the strategy phase.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8"
                  >
                    {campaigns.map((campaign, idx) => (
                      <CampaignCard
                        key={campaign.id}
                        campaign={campaign}
                        index={idx}
                        brandColor="#2070E8"
                        gradient={getGradientForCampaign(idx)}
                        isSelected={selectedCampaign === campaign.id}
                        onSelect={() => setSelectedCampaign(campaign.id)}
                        onPlace={onPlaceOnEdmunds}
                      />
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Campaign Card Component
interface CampaignCardProps {
  campaign: PreBuiltCampaign;
  index: number;
  brandColor?: string;
  gradient: string;
  isSelected: boolean;
  onSelect: () => void;
  onPlace?: (campaign: PreBuiltCampaign) => void;
}

function CampaignCard({
  campaign,
  index,
  brandColor = '#3B82F6',
  gradient,
  isSelected,
  onSelect,
  onPlace,
}: CampaignCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: 0.15 + index * 0.08,
        ease: 'easeOut',
      }}
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'border-blue-500/50 bg-blue-950/20'
          : 'border-zinc-800/50 hover:border-zinc-700/50 bg-zinc-900/40'
      }`}
    >
      {/* Animated background glow on hover */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${brandColor}10 0%, transparent 70%)`,
        }}
      />

      {/* Visual Area with Gradient */}
      <motion.div
        className="relative overflow-hidden h-32 rounded-t-lg"
        style={{ background: gradient }}
      >
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            backgroundImage: `linear-gradient(45deg, transparent 30%, white 50%, transparent 70%)`,
            backgroundSize: '200% 200%',
          }}
        />
        <div className="relative z-10 h-full flex items-end p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.08 }}
            className="text-xs font-semibold px-2 py-1 rounded-full bg-white/20 backdrop-blur text-white"
          >
            {campaign.angle}
          </motion.div>
        </div>
      </motion.div>

      {/* Content Area */}
      <div className="relative z-10 p-5">
        {/* Campaign Name */}
        <h3 className="font-bold text-lg mb-3 line-clamp-2">
          {campaign.name}
        </h3>

        {/* Headline */}
        <p className="text-sm font-semibold text-zinc-200 mb-2 line-clamp-2 leading-tight">
          {campaign.headline}
        </p>

        {/* Body Text */}
        <p className="text-xs text-zinc-400 mb-4 line-clamp-2">
          {campaign.bodyText}
        </p>

        {/* CTA Preview */}
        <div className="mb-4 p-2 rounded bg-zinc-800/50 text-xs text-zinc-300">
          CTA: "{campaign.cta}"
        </div>

        {/* Badges Row 1 */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <motion.span
            className="px-2 py-1 rounded text-xs font-medium bg-zinc-800/60 text-zinc-300"
            whileHover={{ scale: 1.05 }}
          >
            {campaign.platform}
          </motion.span>
          <motion.span
            className="px-2 py-1 rounded text-xs font-medium bg-zinc-800/60 text-zinc-300"
            whileHover={{ scale: 1.05 }}
          >
            {campaign.format}
          </motion.span>
        </div>

        {/* Target & Impact Badges */}
        <div className="flex gap-2 mb-5 flex-wrap">
          <motion.span
            className="px-2 py-1 rounded text-xs font-medium bg-amber-900/40 text-amber-200"
            whileHover={{ scale: 1.05 }}
          >
            {campaign.targetAudience}
          </motion.span>
          <motion.span
            className="px-2 py-1 rounded text-xs font-medium"
            style={{
              backgroundColor: `${brandColor}20`,
              color: brandColor,
            }}
            whileHover={{ scale: 1.05 }}
          >
            {campaign.estimatedImpact}
          </motion.span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800/30">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPlace?.(campaign)}
            className="py-2 px-3 rounded-lg font-semibold text-sm transition-all text-white"
            style={{
              backgroundColor: brandColor,
              boxShadow: `0 0 12px ${brandColor}40`,
            }}
          >
            Place on Edmunds
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="py-2 px-3 rounded-lg font-semibold text-sm border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50 transition-all"
          >
            Save Draft
          </motion.button>
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <motion.div
            layoutId="selected-indicator"
            className="absolute top-3 right-3 w-2 h-2 rounded-full"
            style={{ backgroundColor: brandColor }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>
    </motion.div>
  );
}
