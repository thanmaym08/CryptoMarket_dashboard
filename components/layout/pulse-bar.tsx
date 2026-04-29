"use client"

/**
 * PulseBar Component
 * - Sticky top bar that stays visible while scrolling
 * - Displays 5 live market metrics computed from the CoinGecko data:
 *   1. Global Market Cap (aggregated across all fetched coins)
 *   2. Fear & Greed Index (simulated from gainers vs losers ratio)
 *   3. AI Sentiment (simulated bullish/cautious signal)
 *   4. Top Gainers count (> +5% in 24h)
 *   5. Top Losers count (< -5% in 24h)
 * - Icons scale up on hover for tactile feedback
 * - Uses CSS variables for automatic light/dark adaptation
 */

import { motion } from "framer-motion"
import { Globe, Activity, BrainCircuit, TrendingUp, TrendingDown } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { fetchCoinMarkets } from "@/lib/api"
import { cn } from "@/lib/utils"

/** Compact formatter: T = trillion, B = billion, M = million */
function formatMarketCap(num: number | undefined): string {
  if (!num) return "$--"
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
  return `$${(num / 1e6).toFixed(0)}M`
}

export function PulseBar() {
  // Re-use the same TanStack Query cache as the dashboard (deduplicated)
  const { data: coins } = useQuery({
    queryKey: ["coinMarkets", "market_cap_desc"],
    queryFn: () => fetchCoinMarkets("usd", "market_cap_desc"),
    refetchInterval: 5000,
    placeholderData: (previousData) => previousData,
  })

  // ── Metric Computations ──
  const totalMcap = coins?.reduce((sum, c) => sum + (c.market_cap || 0), 0)
  const topGainers = coins?.filter((c) => (c.price_change_percentage_24h ?? 0) > 5).length ?? 0
  const topLosers = coins?.filter((c) => (c.price_change_percentage_24h ?? 0) < -5).length ?? 0

  // Simulated Fear & Greed: if gainers outnumber losers → Greed, else Fear
  const fearGreed = topGainers > topLosers ? "Greed" : "Fear"
  const fearGreedColor = topGainers > topLosers ? "text-emerald-500" : "text-red-500"
  const fearGreedVal = topGainers > topLosers ? 65 : 35

  // Simulated AI Sentiment: bullish when market is green
  const aiSentiment = topGainers > topLosers ? "Bullish" : "Cautious"
  const aiColor = topGainers > topLosers ? "text-primary" : "text-amber-500"

  // Data rows rendered left-to-right with staggered entrance animation
  const items = [
    {
      icon: Globe,
      label: "Global Market Cap",
      value: formatMarketCap(totalMcap),
      sub: "Total",
      color: "text-foreground",
    },
    {
      icon: Activity,
      label: "Fear & Greed",
      value: fearGreed,
      sub: `${fearGreedVal}/100`,
      color: fearGreedColor,
    },
    {
      icon: BrainCircuit,
      label: "AI Sentiment",
      value: aiSentiment,
      sub: "Real-time",
      color: aiColor,
    },
    {
      icon: TrendingUp,
      label: "Top Gainers",
      value: `${topGainers}`,
      sub: "> +5%",
      color: "text-emerald-500",
    },
    {
      icon: TrendingDown,
      label: "Top Losers",
      value: `${topLosers}`,
      sub: "< -5%",
      color: "text-red-500",
    },
  ]

  return (
    <div className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-2xl">
      <div className="flex h-12 items-center gap-6 overflow-x-auto px-4 scrollbar-none">
        {items.map((item, i) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 shrink-0"
            >
              {/* Icon scales 1.2x on hover for tactile feel */}
              <motion.div whileHover={{ scale: 1.2 }} transition={{ duration: 0.15 }}>
                <Icon className={cn("h-4 w-4", item.color)} />
              </motion.div>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                {item.label}
              </span>
              <span className={cn("text-sm font-bold", item.color)}>{item.value}</span>
              <span className="text-[10px] text-muted-foreground/60">{item.sub}</span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
