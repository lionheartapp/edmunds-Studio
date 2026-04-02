"use client"

import { useState, useEffect, lazy, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import StepIndicator from "@/components/StepIndicator"

const Orb = lazy(() => import("@/components/Orb"))

interface FullPageLoaderProps {
  title: string
  messages: string[]
}

export default function FullPageLoader({ title, messages }: FullPageLoaderProps) {
  const [msgIndex, setMsgIndex] = useState(() =>
    Math.floor(Math.random() * messages.length)
  )

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    const start = () => {
      if (interval) return
      interval = setInterval(() => {
        setMsgIndex((prev) => (prev + 1) % messages.length)
      }, 3000)
    }

    const onVisChange = () => {
      if (document.hidden) {
        if (interval) {
          clearInterval(interval)
          interval = null
        }
      } else {
        start()
      }
    }

    start()
    document.addEventListener("visibilitychange", onVisChange)
    return () => {
      if (interval) clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisChange)
    }
  }, [messages.length])

  return (
    <div className="min-h-screen flex flex-col">
      <StepIndicator />
      <div className="flex-1 flex items-center justify-center px-6">
        {/* Orb container — text overlaid inside */}
        <div className="relative w-[28rem] h-[28rem]">
          <Suspense
            fallback={
              <div className="w-full h-full rounded-full bg-eds-50/20 blur-xl animate-pulse" />
            }
          >
            <Orb
              hue={0}
              hoverIntensity={0.3}
              rotateOnHover
              forceHoverState
              backgroundColor="#09090b"
            />
          </Suspense>

          {/* Centered text overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-8">
            <p className="text-xl font-semibold text-zinc-200 mb-3 text-center animate-[fade-in_0.5s_ease-out_both]">
              {title}
            </p>
            <div className="h-6 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={msgIndex}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-zinc-500 text-center"
                >
                  {messages[msgIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
