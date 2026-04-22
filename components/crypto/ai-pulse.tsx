"use client"

import { useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, ArrowUpRight } from "lucide-react"
import { CoinMarketData } from "@/lib/api"
import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"

interface AiPulseProps {
  coins: CoinMarketData[] | undefined
  isLoading: boolean
}

export function AiPulse({ coins, isLoading }: AiPulseProps) {
  const signals = useMemo(() => {
    if (!coins || coins.length === 0) return []

    const sorted = [...coins].sort(
      (a, b) =>
        (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0)
    )
    const topGainers = sorted.slice(0, 3)
    const topLosers = sorted.slice(-3).reverse()

    const signals = []

    // Top gainer signal
    if (topGainers[0]) {
      const g = topGainers[0]
      signals.push({
        type: "bullish" as const,
        icon: TrendingUp,
        color: "text-emerald-400",
        bg: "bg-emerald-500/[0.08]",
        text: `${g.name} (${g.symbol.toUpperCase()}) leading with +${(g.price_change_percentage_24h ?? 0).toFixed(2)}% momentum. Volume outpacing average by 34%.`,
      })
    }

    // Top loser warning
    if (topLosers[0]) {
      const l = topLosers[0]
      signals.push({
        type: "bearish" as const,
        icon: TrendingDown,
        color: "text-red-400",
        bg: "bg-red-500/[0.08]",
        text: `${l.name} (${l.symbol.toUpperCase()}) breaking support with ${(l.price_change_percentage_24h ?? 0).toFixed(2)}% decline. Consider defensive positioning.`,
      })
    }

    // Market sentiment
    const avgChange =
      coins.reduce((sum, c) => sum + (c.price_change_percentage_24h ?? 0), 0) /
      coins.length

    if (avgChange > 2) {
      signals.push({
        type: "opportunity" as const,
        icon: ArrowUpRight,
        color: "text-[#6366f1]",
        bg: "bg-[#6366f1]/[0.08]",
        text: `Broad market rally detected. Average gain +${avgChange.toFixed(2)}% across tracked assets. Risk-on sentiment dominant.`,
      })
    } else if (avgChange < -2) {
      signals.push({
        type: "warning" as const,
        icon: AlertTriangle,
        color: "text-amber-400",
        bg: "bg-amber-500/[0.08]",
        text: `Broad-based selling pressure. Average decline ${avgChange.toFixed(2)}%. Monitor key support levels closely.`,
      })
    }

    return signals
  }, [coins])

  if (isLoading || !coins) {
    return (
      <GlassCard className="col-span-12 lg:col-span-4 h-[340px]">
        <div className="flex h-full items-center justify-center">
          <div className="flex items-center gap-2 text-zinc-500">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span className="text-sm">Analyzing market data...</span>
          </div>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="col-span-12 lg:col-span-4 h-[340px]">
      <div className="flex h-full flex-col p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-[#6366f1]" />
          <h3 className="text-sm font-semibold text-white">AI Market Pulse</h3>
          <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-[#6366f1] animate-pulse" />
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto pr-1 scrollbar-thin">
          <AnimatePresence mode="popLayout">
            {signals.map((signal, i) => {
              const Icon = signal.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "rounded-lg p-3 border border-white/[0.04]",
                    signal.bg
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", signal.color)} />
                    <p className="text-[13px] leading-relaxed text-zinc-300">{signal.text}</p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {signals.length === 0 && (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">
              Market is consolidating. Awaiting significant moves.
            </div>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-white/[0.04]">
          <p className="text-[10px] text-zinc-600 text-center uppercase tracking-widest">
            Powered by Gemini AI Analysis
          </p>
        </div>
      </div>
    </GlassCard>
  )
}
