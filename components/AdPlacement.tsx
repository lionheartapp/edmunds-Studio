'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AdPlacementProps {
  campaign: {
    name: string
    headline: string
    bodyText: string
    cta: string
    format: string
    thumbnailDesc: string
    platform: string
    targetAudience: string
  }
  brandColors: { primary: string; secondary: string; accent: string }
  brandName: string
  onPlace: (placement: PlacementConfig) => void
  onBack: () => void
}

interface PlacementConfig {
  format: string
  targeting: {
    makes: string[]
    funnelStage: string[]
    zipCodes: string[]
    radius: number
  }
  budget: {
    daily: number
    total: number
  }
  schedule: {
    startDate: string
    endDate: string
  }
}

const VEHICLE_MAKES = [
  'Toyota',
  'Honda',
  'Ford',
  'Chevrolet',
  'BMW',
  'Mercedes-Benz',
  'Subaru',
  'Lexus',
  'Audi',
  'Volkswagen',
]

const FUNNEL_STAGES = [
  { id: 'researching', label: 'Researching' },
  { id: 'comparing', label: 'Comparing' },
  { id: 'ready-to-buy', label: 'Ready to Buy' },
]

const FORMAT_OPTIONS = [
  {
    id: 'display-banner',
    name: 'Display Banner',
    description: 'Leaderboard banner at top of page',
    impressionRange: '50K - 200K/month',
    cpmRange: '$5 - $15',
    specs: '728x90 pixels',
    placement: 'Vehicle pages, Homepage',
  },
  {
    id: 'sponsored-listing',
    name: 'Sponsored Listing',
    description: 'Pinned at top of search results',
    impressionRange: '100K - 300K/month',
    cpmRange: '$8 - $20',
    specs: 'Full width listing',
    placement: 'Inventory search results',
  },
  {
    id: 'native-content',
    name: 'Native Content',
    description: 'Blends with editorial content',
    impressionRange: '150K - 400K/month',
    cpmRange: '$10 - $25',
    specs: 'Card format',
    placement: 'Articles, Reviews, Feeds',
  },
  {
    id: 'video-preroll',
    name: 'Video Pre-Roll',
    description: 'Before video content',
    impressionRange: '75K - 250K/month',
    cpmRange: '$15 - $40',
    specs: '16:9 video player',
    placement: 'Video pages',
  },
]

// Inline SVG Icons
const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
)

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="16 6 8.5 13.5 4 9"></polyline>
  </svg>
)

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="2" y1="2" x2="14" y2="14"></line>
    <line x1="14" y1="2" x2="2" y2="14"></line>
  </svg>
)

const PlayIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="currentColor">
    <polygon points="16 8 16 40 40 24"></polygon>
  </svg>
)

const SkipIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M13 2v12M2 2l11 6-11 6V2z"></path>
  </svg>
)

// Format Preview Components
const DisplayBannerPreview = ({ campaign, brandColors }: any) => (
  <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-xl">
    <div className="h-96 bg-gradient-to-b from-slate-800 to-slate-900 p-6">
      {/* Mockup of Edmunds page */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-red-600 rounded"></div>
          <span className="text-slate-400 text-sm">edmunds.com</span>
        </div>
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 rounded p-4 mb-6 glow-accent"
          style={{ boxShadow: `0 0 20px ${brandColors.primary}40` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-white font-bold text-sm mb-1">{campaign.headline}</div>
              <div className="text-slate-300 text-xs">{campaign.cta}</div>
            </div>
            <button
              className="px-3 py-1 rounded text-xs font-semibold text-white"
              style={{ backgroundColor: brandColors.primary }}
            >
              {campaign.cta}
            </button>
          </div>
        </motion.div>

        {/* Page content below */}
        <div className="space-y-3">
          <div className="h-3 bg-slate-700 rounded w-3/4"></div>
          <div className="h-3 bg-slate-700 rounded w-1/2"></div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-slate-700 h-32 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)

const SponsoredListingPreview = ({ campaign, brandColors }: any) => (
  <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-xl">
    <div className="h-96 bg-gradient-to-b from-slate-800 to-slate-900 p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-red-600 rounded"></div>
          <span className="text-slate-400 text-sm">Inventory Search</span>
        </div>

        {/* Sponsored listing at top */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-4 mb-4 glow-accent"
          style={{ boxShadow: `0 0 20px ${brandColors.primary}40` }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2 py-1 rounded bg-blue-600 text-white">
                  Sponsored
                </span>
                <span className="text-white font-bold text-sm">{campaign.headline}</span>
              </div>
              <div className="text-slate-400 text-xs mb-2">Dealer • 12,500 miles • 2024</div>
              <div className="text-white font-bold text-sm mb-3">$28,450</div>
              <button
                className="px-3 py-1 rounded text-xs font-semibold text-white"
                style={{ backgroundColor: brandColors.primary }}
              >
                {campaign.cta}
              </button>
            </div>
            <div className="w-20 h-20 bg-slate-600 rounded"></div>
          </div>
        </motion.div>

        {/* Regular listings below */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="text-white font-semibold text-sm mb-1">Vehicle Listing {i}</div>
                <div className="text-slate-400 text-xs mb-2">Dealer • Miles • Year</div>
                <div className="text-white font-bold text-sm">$XX,XXX</div>
              </div>
              <div className="w-20 h-20 bg-slate-600 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const NativeContentPreview = ({ campaign, brandColors }: any) => (
  <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-xl">
    <div className="h-96 bg-gradient-to-b from-slate-800 to-slate-900 p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-red-600 rounded"></div>
        <span className="text-slate-400 text-sm">edmunds.com Article Feed</span>
      </div>

      {/* Articles */}
      {[1, 2].map((i) => (
        <div
          key={i}
          className="bg-slate-800 border border-slate-700 rounded-lg p-3"
          style={{ opacity: i === 2 ? 0.6 : 1 }}
        >
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 bg-slate-600 rounded flex-shrink-0"></div>
            <div className="flex-1">
              <div className="text-slate-400 text-xs mb-1">Article</div>
              <div className="text-white text-sm font-semibold">Editorial Content</div>
              <div className="text-slate-400 text-xs mt-1">2 days ago</div>
            </div>
          </div>
        </div>
      ))}

      {/* Native Ad Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-4 glow-accent"
        style={{ boxShadow: `0 0 20px ${brandColors.primary}40` }}
      >
        <div className="flex items-start gap-3">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded flex-shrink-0 flex items-center justify-center text-slate-400 text-xs">
            {campaign.thumbnailDesc}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                Sponsored
              </span>
            </div>
            <div className="text-white text-sm font-bold mb-1">{campaign.headline}</div>
            <div className="text-slate-300 text-xs mb-2 line-clamp-2">{campaign.bodyText}</div>
            <button
              className="text-xs font-semibold px-3 py-1 rounded text-white"
              style={{ backgroundColor: brandColors.primary }}
            >
              {campaign.cta}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
)

const VideoPrerollPreview = ({ campaign, brandColors }: any) => (
  <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-xl">
    <div className="h-96 bg-slate-950 p-6 flex flex-col items-center justify-center">
      {/* Video player mockup */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm aspect-video bg-black rounded-lg relative overflow-hidden glow-accent border border-slate-700"
        style={{ boxShadow: `0 0 30px ${brandColors.primary}40` }}
      >
        {/* Brand overlay */}
        <div
          className="absolute top-4 left-4 px-3 py-2 rounded text-white text-xs font-bold z-10"
          style={{ backgroundColor: brandColors.primary }}
        >
          {campaign.brandName || 'Brand'}
        </div>

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="text-white hover:text-slate-200 transition">
            <PlayIcon />
          </div>
        </div>

        {/* Skip button */}
        <div className="absolute bottom-4 right-4 bg-slate-900/80 text-slate-300 text-xs px-3 py-1 rounded flex items-center gap-1 z-10">
          <SkipIcon />
          Skip in 5s
        </div>
      </motion.div>

      {/* CTA below video */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 text-center"
      >
        <button
          className="px-6 py-2 rounded-lg font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: brandColors.primary }}
        >
          {campaign.cta}
        </button>
        <p className="text-slate-400 text-xs mt-2">{campaign.headline}</p>
      </motion.div>
    </div>
  </div>
)

export default function AdPlacement({
  campaign,
  brandColors,
  brandName,
  onPlace,
  onBack,
}: AdPlacementProps) {
  const [section, setSection] = useState<'format' | 'targeting' | 'budget'>(
    'format'
  )
  const [selectedFormat, setSelectedFormat] = useState(FORMAT_OPTIONS[0].id)
  const [selectedMakes, setSelectedMakes] = useState<string[]>([])
  const [selectedFunnelStages, setSelectedFunnelStages] = useState<string[]>([])
  const [zipCodes, setZipCodes] = useState<string[]>([''])
  const [radius, setRadius] = useState(25)
  const [selectedPages, setSelectedPages] = useState<string[]>([])
  const [dailyBudget, setDailyBudget] = useState(500)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Calculate campaign duration in days
  const campaignDays = useMemo(() => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
  }, [startDate, endDate])

  // Calculate estimated metrics
  const totalBudget = dailyBudget * campaignDays || 0
  const formatOption = FORMAT_OPTIONS.find((f) => f.id === selectedFormat)
  const estimatedImpressions = campaignDays > 0 ? Math.floor(Math.random() * 150000 + 50000) : 0
  const estimatedCPM = formatOption
    ? parseInt(formatOption.cpmRange.split(' - $')[0].replace('$', '')) +
      Math.random() * 10
    : 0
  const estimatedClicks = Math.floor(estimatedImpressions * 0.02)

  // Handle format selection
  const handleFormatSelect = (formatId: string) => {
    setSelectedFormat(formatId)
  }

  // Handle make selection
  const toggleMake = (make: string) => {
    setSelectedMakes((prev) =>
      prev.includes(make) ? prev.filter((m) => m !== make) : [...prev, make]
    )
  }

  // Handle funnel stage selection
  const toggleFunnelStage = (stageId: string) => {
    setSelectedFunnelStages((prev) =>
      prev.includes(stageId) ? prev.filter((s) => s !== stageId) : [...prev, stageId]
    )
  }

  // Handle zip code changes
  const updateZipCode = (index: number, value: string) => {
    const newZipCodes = [...zipCodes]
    newZipCodes[index] = value
    setZipCodes(newZipCodes.filter((z) => z !== ''))
  }

  // Handle page selection
  const togglePage = (page: string) => {
    setSelectedPages((prev) =>
      prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page]
    )
  }

  // Handle placement
  const handlePlaceOnEdmunds = () => {
    const config: PlacementConfig = {
      format: selectedFormat,
      targeting: {
        makes: selectedMakes,
        funnelStage: selectedFunnelStages,
        zipCodes: zipCodes.filter((z) => z),
        radius,
      },
      budget: {
        daily: dailyBudget,
        total: totalBudget,
      },
      schedule: {
        startDate,
        endDate,
      },
    }
    onPlace(config)
  }

  // Estimate reach based on targeting
  const estimatedReach = useMemo(() => {
    let baseReach = 50000
    if (selectedMakes.length > 0) baseReach *= 0.8
    if (selectedFunnelStages.length > 0) baseReach *= 0.6
    if (zipCodes.filter((z) => z).length > 0) baseReach *= 0.5
    return Math.floor(baseReach)
  }, [selectedMakes, selectedFunnelStages, zipCodes])

  const currentFormatOption = FORMAT_OPTIONS.find((f) => f.id === selectedFormat)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="border-b border-slate-700 px-8 py-6 bg-gradient-to-r from-slate-900 to-slate-800">
          <h1 className="text-2xl font-bold text-white mb-2">Place on Edmunds</h1>
          <p className="text-slate-400 text-sm">
            {campaign.name} — Configure format, targeting, and budget
          </p>
        </div>

        {/* Section Tabs */}
        <div className="border-b border-slate-700 px-8 flex gap-1 bg-slate-900/50">
          {(['format', 'targeting', 'budget'] as const).map((sec, idx) => (
            <motion.button
              key={sec}
              onClick={() => setSection(sec)}
              className={`px-6 py-4 font-semibold text-sm transition-all ${
                section === sec
                  ? 'text-white border-b-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <span className="text-xs font-bold mr-2 text-indigo-400">
                {idx + 1}
              </span>
              {sec === 'format' && 'Format'}
              {sec === 'targeting' && 'Targeting'}
              {sec === 'budget' && 'Budget'}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
          <AnimatePresence mode="wait">
            {/* SECTION 1: FORMAT & PREVIEW */}
            {section === 'format' && (
              <motion.div
                key="format"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Choose Ad Format</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {FORMAT_OPTIONS.map((format) => (
                      <motion.button
                        key={format.id}
                        onClick={() => handleFormatSelect(format.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-6 rounded-lg border-2 transition-all text-left ${
                          selectedFormat === format.id
                            ? 'border-slate-500 bg-slate-700/50'
                            : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                        }`}
                        style={
                          selectedFormat === format.id
                            ? { boxShadow: "0 0 20px rgba(99,102,241,0.18)" }
                            : {}
                        }
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-white text-sm mb-1">
                              {format.name}
                            </h3>
                            <p className="text-slate-400 text-xs">{format.description}</p>
                          </div>
                          {selectedFormat === format.id && (
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0 bg-indigo-500"
                            >
                              <CheckIcon />
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="text-slate-400">
                            <span className="text-slate-300 font-semibold">Impressions:</span>{' '}
                            {format.impressionRange}
                          </div>
                          <div className="text-slate-400">
                            <span className="text-slate-300 font-semibold">CPM:</span>{' '}
                            {format.cpmRange}
                          </div>
                          <div className="text-slate-400">
                            <span className="text-slate-300 font-semibold">Specs:</span>{' '}
                            {format.specs}
                          </div>
                          <div className="text-slate-400">
                            <span className="text-slate-300 font-semibold">Placement:</span>{' '}
                            {format.placement}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">
                    Preview on Edmunds.com
                  </h2>
                  <AnimatePresence mode="wait">
                    {selectedFormat === 'display-banner' && (
                      <motion.div
                        key="display-banner-preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <DisplayBannerPreview
                          campaign={campaign}
                          brandColors={brandColors}
                        />
                      </motion.div>
                    )}
                    {selectedFormat === 'sponsored-listing' && (
                      <motion.div
                        key="sponsored-listing-preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <SponsoredListingPreview
                          campaign={campaign}
                          brandColors={brandColors}
                        />
                      </motion.div>
                    )}
                    {selectedFormat === 'native-content' && (
                      <motion.div
                        key="native-content-preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <NativeContentPreview
                          campaign={campaign}
                          brandColors={brandColors}
                        />
                      </motion.div>
                    )}
                    {selectedFormat === 'video-preroll' && (
                      <motion.div
                        key="video-preroll-preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <VideoPrerollPreview
                          campaign={campaign}
                          brandColors={brandColors}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* SECTION 2: TARGETING */}
            {section === 'targeting' && (
              <motion.div
                key="targeting"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Vehicle Makes */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Vehicle Makes</h3>
                  <div className="flex flex-wrap gap-2">
                    {VEHICLE_MAKES.map((make) => (
                      <motion.button
                        key={make}
                        onClick={() => toggleMake(make)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                          selectedMakes.includes(make)
                            ? 'text-white bg-indigo-600'
                            : 'text-slate-400 bg-slate-800 hover:bg-slate-700'
                        }`}
                        style={
                          selectedMakes.includes(make)
                            ? { boxShadow: "0 0 12px rgba(99,102,241,0.3)" }
                            : {}
                        }
                      >
                        {make}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Funnel Stage */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Funnel Stage</h3>
                  <div className="flex flex-wrap gap-2">
                    {FUNNEL_STAGES.map((stage) => (
                      <motion.button
                        key={stage.id}
                        onClick={() => toggleFunnelStage(stage.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                          selectedFunnelStages.includes(stage.id)
                            ? 'text-white bg-indigo-600'
                            : 'text-slate-400 bg-slate-800 hover:bg-slate-700'
                        }`}
                        style={
                          selectedFunnelStages.includes(stage.id)
                            ? { boxShadow: "0 0 12px rgba(99,102,241,0.3)" }
                            : {}
                        }
                      >
                        {stage.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Location Targeting */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Location Targeting</h3>
                  <div className="space-y-4">
                    {/* Zip Codes */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Zip Codes
                      </label>
                      <div className="space-y-2">
                        {zipCodes.map((zip, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={zip}
                              onChange={(e) => updateZipCode(idx, e.target.value)}
                              placeholder="Enter zip code..."
                              maxLength={5}
                              className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-slate-600 focus:outline-none transition-colors"
                            />
                            {zipCodes.filter((z) => z).length > 1 && (
                              <button
                                onClick={() =>
                                  setZipCodes(
                                    zipCodes.filter((_, i) => i !== idx)
                                  )
                                }
                                className="p-2 text-slate-400 hover:text-white transition"
                              >
                                <XIcon />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      {zipCodes.filter((z) => z).length < 5 && (
                        <button
                          onClick={() => setZipCodes([...zipCodes, ''])}
                          className="mt-3 text-sm text-slate-400 hover:text-white transition"
                        >
                          + Add zip code
                        </button>
                      )}
                    </div>

                    {/* Radius */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-semibold text-slate-300">
                          Search Radius
                        </label>
                        <span className="text-sm font-bold text-indigo-400">
                          {radius} miles
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={radius}
                        onChange={(e) => setRadius(Number(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #6366f1, #6366f1) 0% ${(radius / 100) * 100}%, #1e293b ${(radius / 100) * 100}% 100%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Pages */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Display on Pages</h3>
                  <div className="space-y-2">
                    {['Vehicle Pages', 'Reviews', 'Comparisons', 'Inventory', 'Homepage'].map(
                      (page) => (
                        <label
                          key={page}
                          className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPages.includes(page)}
                            onChange={() => togglePage(page)}
                            className="w-4 h-4 rounded"
                            style={{ accentColor: "#6366f1" }}
                          />
                          <span className="text-white text-sm font-medium">{page}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>

                {/* Audience Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-lg border border-indigo-500/25 bg-gradient-to-r from-slate-800/50 to-slate-700/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Estimated Monthly Reach</p>
                      <p className="text-3xl font-bold text-white">
                        {estimatedReach.toLocaleString()}
                      </p>
                    </div>
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center bg-indigo-500/20"
                    >
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="2"
                      >
                        <circle cx="16" cy="16" r="14"></circle>
                        <polyline points="16 12 20 16 16 20"></polyline>
                        <line x1="12" y1="16" x2="20" y2="16"></line>
                      </svg>
                    </div>
                  </div>
                  <p className="text-slate-400 text-xs mt-3">
                    Based on selected makes, funnel stages, and location targeting
                  </p>
                </motion.div>
              </motion.div>
            )}

            {/* SECTION 3: BUDGET & SCHEDULE */}
            {section === 'budget' && (
              <motion.div
                key="budget"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Daily Budget */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Daily Budget</h3>
                    <div className="text-2xl font-bold text-indigo-400">
                      ${dailyBudget.toLocaleString()}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="5000"
                    step="50"
                    value={dailyBudget}
                    onChange={(e) => setDailyBudget(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #6366f1, #6366f1) 0% ${((dailyBudget - 50) / (5000 - 50)) * 100}%, #1e293b ${((dailyBudget - 50) / (5000 - 50)) * 100}% 100%`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>$50</span>
                    <span>$5,000</span>
                  </div>
                </div>

                {/* Campaign Schedule */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Campaign Schedule</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-slate-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-slate-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  {campaignDays > 0 && (
                    <p className="text-xs text-slate-400 mt-2">
                      Campaign duration: {campaignDays} days
                    </p>
                  )}
                </div>

                {/* Estimated Totals */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-lg border-2 border-indigo-500/30 bg-gradient-to-br from-slate-800/50 to-slate-700/50"
                  style={{ boxShadow: "0 0 20px rgba(99,102,241,0.12)" }}
                >
                  <h3 className="text-lg font-bold text-white mb-6">Estimated Campaign Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Total Campaign Spend</p>
                      <p className="text-3xl font-bold text-white">
                        ${totalBudget.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Estimated Impressions</p>
                      <p className="text-3xl font-bold text-white">
                        {estimatedImpressions.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Estimated Clicks</p>
                      <p className="text-3xl font-bold text-white">
                        {estimatedClicks.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Est. CPM</p>
                      <p className="text-3xl font-bold text-white">
                        ${estimatedCPM.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Action Bar */}
        <div className="border-t border-slate-700 px-8 py-6 bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs text-slate-400">
              Ads are subject to Edmunds review before going live
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="px-6 py-3 rounded-lg font-semibold text-white bg-slate-800 hover:bg-slate-700 transition"
            >
              Back
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePlaceOnEdmunds}
              className="px-6 py-3 rounded-lg font-semibold text-white flex items-center gap-2 transition bg-indigo-600"
              style={{ boxShadow: "0 0 20px rgba(99,102,241,0.3)" }}
            >
              Place on Edmunds
              <ChevronRightIcon />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
