"use client"

/**
 * GlassCard Component
 * - Reusable glassmorphic card wrapper used across the dashboard
 * - Background tint auto-adapts to light/dark via CSS custom properties (--glass-tint)
 * - Supports a shimmer sweep animation triggered by price updates
 * - Supports semantic glow colors (green/red) for extreme market moves
 * - Uses Framer Motion for layout transitions and hover lift
 */

import { useRef, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  /** Triggers a diagonal shimmer sweep across the card surface */ 
  shimmer?: boolean
  /** Glow color when a coin makes an extreme move (>8% up/down) */
  semanticGlow?: "green" | "red" | "neutral"
  layoutId?: string
  onClick?: () => void
}

export function GlassCard({
  children,
  className,
  shimmer = false,
  semanticGlow,
  layoutId,
  onClick,
}: GlassCardProps) {
  // Local shimmer state — fires when `shimmer` prop flips to true
  const [isShimmering, setIsShimmering] = useState(false)
  const shimmerTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (shimmer) {
      setIsShimmering(true)
      if (shimmerTimer.current) clearTimeout(shimmerTimer.current)
      shimmerTimer.current = setTimeout(() => setIsShimmering(false), 1200)
    }
    return () => {
      if (shimmerTimer.current) clearTimeout(shimmerTimer.current)
    }
  }, [shimmer])

  // Semantic glow shadows: green for surges, red for crashes
  const glowColors = {
    green: "shadow-[0_0_24px_rgba(34,197,94,0.12)] border-emerald-500/20",
    red: "shadow-[0_0_24px_rgba(239,68,68,0.12)] border-red-500/20",
    neutral: "",
  }

  return (
    <motion.div
      layout={layoutId ? true : false}
      layoutId={layoutId}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl",
        // Core glass effect: CSS var(--glass-tint) adapts light/dark automatically
        "glass-card glass-card-hover backdrop-blur-2xl",
        semanticGlow && glowColors[semanticGlow],
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Shimmer overlay — diagonal white streak sweeping left-to-right */}
      <AnimatePresence>
        {isShimmering && (
          <motion.div
            initial={{ x: "-100%", opacity: 0.4 }}
            animate={{ x: "200%", opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 z-10 pointer-events-none"
          >
            <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -skew-x-12" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actual card content sits above shimmer layer */}
      <div className="relative z-0">{children}</div>
    </motion.div>
  )
}
