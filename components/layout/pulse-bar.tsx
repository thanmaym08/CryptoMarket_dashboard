"use client"

import { motion } from "framer-motion"
import { Globe, Activity, BrainCircuit, TrendingUp, TrendingDown } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { fetchCoinMarkets } from "@/lib/api"
import { cn } from "@/lib/utils"

function formatMarketCap(num: number | undefined): string {
  if (!num) return "$--"
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
  return `$${(num / 1e6).toFixed(0)}M`
}

export function PulseBar() {
  const { data: coins } = useQuery({
    queryKey: ["coinMarkets", "market_cap_desc"],
    queryFn: () => fetchCoinMarkets("usd", "market_cap_desc"),
    refetchInterval: 5000,
    placeholderData: (previousData) => previousData,
  })

  const totalMcap = coins?.reduce((sum, c) => sum + (c.market_cap || 0), 0)
  const topGainers = coins?.filter((c) => (c.price_change_percentage_24h ?? 0) > 5).length ?? 0
  const topLosers = coins?.filter((c) => (c.price_change_percentage_24h ?? 0) < -5).length ?? 0

  // Simulated fear/greed based on gainers vs losers
  const fearGreed = topGainers > topLosers ? "Greed" : "Fear"
  const fearGreedColor = topGainers > topLosers ? "text-emerald-400" : "text-red-400"
  const fearGreedVal = topGainers > topLosers ? 65 : 35

  // Simulated AI sentiment
  const aiSentiment = topGainers > topLosers ? "Bullish" : "Cautious"
  const aiColor = topGainers > topLosers ? "text-[#6366f1]" : "text-amber-400"

  const items = [
    {
      icon: Globe,
      label: "Global Market Cap",
      value: formatMarketCap(totalMcap),
      sub: "Total",
      color: "text-white",
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
      color: "text-emerald-400",
    },
    {
      icon: TrendingDown,
      label: "Top Losers",
      value: `${topLosers}`,
      sub: "< -5%",
      color: "text-red-400",
    },
  ]

  return (
    <div className="sticky top-0 z-30 border-b border-white/[0.05] bg-[#09090b]/80 backdrop-blur-2xl">
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
              <Icon className={cn("h-3.5 w-3.5", item.color)} />
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                {item.label}
              </span>
              <span className={cn("text-sm font-bold", item.color)}>{item.value}</span>
              <span className="text-[10px] text-zinc-600">{item.sub}</span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
