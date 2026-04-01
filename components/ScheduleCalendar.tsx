"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ScheduleSlot, PLATFORM_DIMENSIONS } from "@/lib/types"

interface ScheduleCalendarProps {
  slots: ScheduleSlot[]
  onUpdateSlot: (index: number, updates: Partial<ScheduleSlot>) => void
  onScheduleAll: () => void
}

export default function ScheduleCalendar({
  slots,
  onUpdateSlot,
  onScheduleAll,
}: ScheduleCalendarProps) {
  return (
    <div className="max-w-3xl mx-auto p-8 bg-zinc-950 min-h-screen">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-3xl font-bold mb-2 accent-gradient-text"
      >
        Schedule Campaign
      </motion.h2>
      <p className="text-zinc-400 mb-8">
        Claude picked optimal posting times. Adjust if needed.
      </p>

      <div className="space-y-4 mb-8">
        {slots.map((slot, i) => (
          <motion.div
            key={`${slot.platform}-${i}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
          >
            {/* Platform Badge */}
            <div className="flex-shrink-0 px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-sm font-medium text-zinc-300">
              {PLATFORM_DIMENSIONS[slot.platform]?.label || slot.platform}
            </div>

            {/* DateTime Picker */}
            <input
              type="datetime-local"
              value={slot.scheduledAt.slice(0, 16)}
              onChange={(e) =>
                onUpdateSlot(i, { scheduledAt: new Date(e.target.value).toISOString() })
              }
              className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500
                       focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 text-sm"
            />

            {/* Status Badge */}
            <span className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
              slot.status === "scheduled"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : slot.status === "published"
                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
                : "bg-zinc-800 text-zinc-400 border border-zinc-700"
            }`}>
              {slot.status}
            </span>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onScheduleAll}
        className="w-full py-4 bg-indigo-600 text-zinc-100 font-semibold rounded-xl
                 hover:bg-indigo-500 transition-colors text-lg glow-sm shadow-lg shadow-indigo-500/20"
      >
        Schedule All
      </motion.button>
    </div>
  )
}
