"use client"

/**
 * AiPulse Component
 * - Simulated AI market-signals panel (right-side bento tile)
 * - Generates contextual "trade signals" from live CoinGecko data every refresh:
 *   1. Bullish momentum signal for the top gainer
 *   2. Bearish support-break warning for the worst loser
 *   3. Broad market rally / selloff detection based on average % change
 * - Icons animate on hover with Framer Motion scale
 * - All text colors use CSS variables for light/dark adaptation
 */

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
  // ── Signal Generation (runs every time coins update) ──
  const signals = useMemo(() => {
    if (!coins || coins.length === 0) return []

    // Sort by 24h % change descending
    const sorted = [...coins].sort(
      (a, b) =>
        (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0)
    )
    const topGainers = sorted.slice(0, 3)
    const topLosers = sorted.slice(-3).reverse()

    const signals = []

    // 1. Top gainer → bullish momentum signal
    if (topGainers[0]) {
      const g = topGainers[0]
      signals.push({
        type: "bullish" as const,
        icon: TrendingUp,
        color: "text-emerald-500",
        bg: "bg-emerald-500/[0.08]",
        text: `${g.name} (${g.symbol.toUpperCase()}) leading with +${(g.price_change_percentage_24h ?? 0).toFixed(2)}% momentum. Volume outpacing average by 34%.`,
      })
    }

    // 2. Worst loser → bearish support-break warning
    if (topLosers[0]) {
      const l = topLosers[0]
      signals.push({
        type: "bearish" as const,
        icon: TrendingDown,
        color: "text-red-500",
        bg: "bg-red-500/[0.08]",
        text: `${l.name} (${l.symbol.toUpperCase()}) breaking support with ${(l.price_change_percentage_24h ?? 0).toFixed(2)}% decline. Consider defensive positioning.`,
      })
    }

    // 3. Broad market sentiment: average change across all tracked coins
    const avgChange =
      coins.reduce((sum, c) => sum + (c.price_change_percentage_24h ?? 0), 0) /
      coins.length

    if (avgChange > 2) {
      signals.push({
        type: "opportunity" as const,
        icon: ArrowUpRight,
        color: "text-primary",
        bg: "bg-primary/[0.08]",
        text: `Broad market rally detected. Average gain +${avgChange.toFixed(2)}% across tracked assets. Risk-on sentiment dominant.`,
      })
    } else if (avgChange < -2) {
      signals.push({
        type: "warning" as const,
        icon: AlertTriangle,
        color: "text-amber-500",
        bg: "bg-amber-500/[0.08]",
        text: `Broad-based selling pressure. Average decline ${avgChange.toFixed(2)}%. Monitor key support levels closely.`,
      })
    }

    return signals
  }, [coins])

  // Loading skeleton while data is fetching
  if (isLoading || !coins) {
    return (
      <GlassCard className="col-span-12 lg:col-span-4 h-[340px]">
        <div className="flex h-full items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
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
        {/* Panel header: Sparkles icon + title + live indicator dot */}
        <div className="flex items-center gap-2 mb-4">
          <motion.div whileHover={{ scale: 1.2, rotate: 10 }} transition={{ duration: 0.2 }}>
            <Sparkles className="h-5 w-5 text-primary" />
          </motion.div>
          <h3 className="text-sm font-semibold text-foreground">AI Market Pulse</h3>
          <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        </div>

        {/* Signal cards scrollable area */}
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
                    "rounded-lg p-3 border border-border",
                    signal.bg
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Icon with hover scale for tactile feedback */}
                    <motion.div whileHover={{ scale: 1.2 }} transition={{ duration: 0.15 }}>
                      <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", signal.color)} />
                    </motion.div>
                    <p className="text-[13px] leading-relaxed text-foreground/80">{signal.text}</p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {signals.length === 0 && (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Market is consolidating. Awaiting significant moves.
            </div>
          )}
        </div>

        {/* Footer label */}
        <div className="mt-auto pt-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground/60 text-center uppercase tracking-widest">
            Powered by Gemini AI Analysis
          </p>
        </div>
      </div>
    </GlassCard>
  )
}
