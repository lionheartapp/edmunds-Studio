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
    <div className="max-w-3xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-2">Schedule Campaign</h2>
      <p className="text-gray-500 mb-8">
        Claude picked optimal posting times. Adjust if needed.
      </p>

      <div className="space-y-4 mb-8">
        {slots.map((slot, i) => (
          <motion.div
            key={`${slot.platform}-${i}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl"
          >
            {/* Platform Badge */}
            <div className="flex-shrink-0 px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium">
              {PLATFORM_DIMENSIONS[slot.platform]?.label || slot.platform}
            </div>

            {/* DateTime Picker */}
            <input
              type="datetime-local"
              value={slot.scheduledAt.slice(0, 16)}
              onChange={(e) =>
                onUpdateSlot(i, { scheduledAt: new Date(e.target.value).toISOString() })
              }
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg
                       focus:border-blue-500 focus:outline-none text-sm"
            />

            {/* Status */}
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              slot.status === "scheduled" ? "bg-green-100 text-green-700" :
              slot.status === "published" ? "bg-blue-100 text-blue-700" :
              "bg-gray-100 text-gray-500"
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
        className="w-full py-4 bg-blue-600 text-white font-semibold rounded-2xl
                 hover:bg-blue-700 transition-colors text-lg"
      >
        Schedule All
      </motion.button>
    </div>
  )
}
