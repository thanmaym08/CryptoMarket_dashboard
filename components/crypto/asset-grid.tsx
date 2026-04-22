"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Star, Search } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { CoinMarketData } from "@/lib/api"
import { useAppStore } from "@/lib/store"
import { usePriceFlash } from "@/hooks/usePriceFlash"
import { cn } from "@/lib/utils"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

interface AssetGridProps {
  coins: CoinMarketData[] | undefined
  isLoading: boolean
}

function formatPrice(price: number): string {
  if (price >= 1) {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `$${price.toFixed(6)}`
}

function AssetCard({
  coin,
  index,
  isWatched,
  onToggleWatch,
}: {
  coin: CoinMarketData
  index: number
  isWatched: boolean
  onToggleWatch: (id: string) => void
}) {
  const isPositive = (coin.price_change_percentage_24h ?? 0) >= 0
  const { flashState } = usePriceFlash(coin.current_price)

  const change = coin.price_change_percentage_24h ?? 0
  const isExtreme = Math.abs(change) > 8

  const sparklineData =
    coin.sparkline_in_7d?.price.map((p, i) => ({
      index: i,
      price: p,
    })) ?? []

  const color = isPositive ? "#22c55e" : "#ef4444"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      layout
    >
      <GlassCard
        shimmer={flashState !== "neutral"}
        semanticGlow={
          isExtreme && change < 0 ? "red" : isExtreme && change > 0 ? "green" : undefined
        }
        className={cn(
          "h-full",
          isWatched && "border-yellow-500/20"
        )}
      >
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={coin.image}
                alt={coin.name}
                className="h-8 w-8 rounded-full"
              />
              <div>
                <h4 className="text-sm font-semibold text-white">{coin.name}</h4>
                <span className="text-[11px] text-zinc-500 uppercase tracking-wider">
                  {coin.symbol}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleWatch(coin.id)
                }}
                className="rounded-full p-1 transition-colors hover:bg-white/[0.06]"
              >
                <Star
                  className={cn(
                    "h-3.5 w-3.5 transition-colors",
                    isWatched
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-zinc-600"
                  )}
                />
              </button>
              <div
                className={cn(
                  "flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
                  isPositive
                    ? "bg-emerald-500/[0.08] text-emerald-400"
                    : "bg-red-500/[0.08] text-red-400"
                )}
              >
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {isPositive ? "+" : ""}
                {change.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <motion.span
              animate={
                flashState === "up"
                  ? { color: "#22c55e", scale: [1, 1.04, 1] }
                  : flashState === "down"
                  ? { color: "#ef4444", scale: [1, 1.04, 1] }
                  : { color: "#fafafa", scale: 1 }
              }
              transition={{ duration: 0.5 }}
              className="text-xl font-bold tracking-tight"
            >
              {formatPrice(coin.current_price)}
            </motion.span>
          </div>

          {/* Interactive Sparkline */}
          <div className="h-12 group/chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id={`grad-${coin.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null
                    return (
                      <div className="rounded-md border border-white/[0.08] bg-[#09090b]/95 px-2 py-1 text-[10px] text-zinc-300 shadow-xl">
                        ${Number(payload[0].value).toFixed(4)}
                      </div>
                    )
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={color}
                  strokeWidth={1.5}
                  fill={`url(#grad-${coin.id})`}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

export function AssetGrid({ coins, isLoading }: AssetGridProps) {
  const { watchlist, toggleWatchlist, isInWatchlist, smartFilter, searchQuery } = useAppStore()

  const filtered = (() => {
    if (!coins) return []
    let result = [...coins]

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
      )
    }

    // Smart filter
    if (smartFilter === "gainers>5") {
      result = result.filter((c) => (c.price_change_percentage_24h ?? 0) > 5)
    } else if (smartFilter === "losers>5") {
      result = result.filter((c) => (c.price_change_percentage_24h ?? 0) < -5)
    } else if (smartFilter === "top10") {
      result = result.slice(0, 10)
    } else if (smartFilter === "under1") {
      result = result.filter((c) => c.current_price < 1)
    } else if (smartFilter === "watchlist") {
      result = result.filter((c) => watchlist.includes(c.id))
    }

    // Pin watchlist to top
    return result.sort((a, b) => {
      const aW = watchlist.includes(a.id)
      const bW = watchlist.includes(b.id)
      if (aW && !bW) return -1
      if (!aW && bW) return 1
      return 0
    })
  })()

  if (isLoading && !coins) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <GlassCard key={i} className="h-[140px] animate-pulse">
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-white/[0.04]" />
                <div className="space-y-1.5">
                  <div className="h-3 w-20 rounded bg-white/[0.04]" />
                  <div className="h-2 w-10 rounded bg-white/[0.04]" />
                </div>
              </div>
              <div className="h-6 w-24 rounded bg-white/[0.04]" />
              <div className="h-10 rounded bg-white/[0.04]" />
            </div>
          </GlassCard>
        ))}
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-12 w-12 rounded-full bg-white/[0.04] flex items-center justify-center">
          <Search className="h-5 w-5 text-zinc-600" />
        </div>
        <p className="mt-4 text-sm text-zinc-500">No matching assets found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {filtered.map((coin, i) => (
        <AssetCard
          key={coin.id}
          coin={coin}
          index={i}
          isWatched={isInWatchlist(coin.id)}
          onToggleWatch={toggleWatchlist}
        />
      ))}
    </div>
  )
}

