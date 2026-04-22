"use client"

import { useRef, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  shimmer?: boolean
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
        "bg-white/[0.03] backdrop-blur-2xl",
        "border border-white/[0.05]",
        "transition-colors duration-300",
        "hover:bg-white/[0.05] hover:border-white/[0.08]",
        semanticGlow && glowColors[semanticGlow],
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Shimmer overlay */}
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

      {/* Content */}
      <div className="relative z-0">{children}</div>
    </motion.div>
  )
}
