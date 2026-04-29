"use client"

/**
 * AssetGrid + AssetCard Components
 * --------------------------------
 * AssetGrid:
 * - Renders a responsive grid (1→4 columns) of individual coin cards
 * - Applies search filter, smart quick-filters, and sorting
 * - Pins starred watchlist coins to the top of the grid
 * - Skeleton loading state when data is absent
 *
 * AssetCard:
 * - Each card shows: rank #, coin logo, name, symbol, price, 24h % change
 * - Watchlist star button with animated hover scale (1.3x)
 * - Ghost price flash: green pulse when price rises, red when it falls
 * - Semantic glow: cards glow green/red when 24h change exceeds ±8%
 * - Interactive sparkline (7-day) with crosshair tooltip on hover
 * - Click opens DetailDrawer with deep metrics (24h High/Low, Supply, etc.)
 * - Uses CSS variables for light/dark theme adaptation
 */

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Star, Search } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { CoinMarketData } from "@/lib/api"
import { useAppStore } from "@/lib/store"
import { usePriceFlash } from "@/hooks/usePriceFlash"
import { cn } from "@/lib/utils"
import { DetailDrawer } from "./detail-drawer"
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

/** Formats a USD price: 2 decimals above $1, 6 decimals below */
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
  onSelectCoin,
}: {
  coin: CoinMarketData
  index: number
  isWatched: boolean
  onToggleWatch: (id: string) => void
  onSelectCoin: (id: string) => void
}) {
  const isPositive = (coin.price_change_percentage_24h ?? 0) >= 0
  const { flashState } = usePriceFlash(coin.current_price)

  const change = coin.price_change_percentage_24h ?? 0
  const isExtreme = Math.abs(change) > 8

  // Build 7-day sparkline data points for Recharts
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
      {/* Clicking the card opens DetailDrawer; star button is its own trigger */}
      <GlassCard
        shimmer={flashState !== "neutral"}
        semanticGlow={
          isExtreme && change < 0 ? "red" : isExtreme && change > 0 ? "green" : undefined
        }
        onClick={() => onSelectCoin(coin.id)}
        className={cn(
          "h-full",
          isWatched && "border-yellow-500/30"
        )}
      >
        <div className="p-4 space-y-3">
          {/* Header row: rank # + logo + name/symbol + star + change badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* Market-cap rank circle */}
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                {coin.market_cap_rank ?? "–"}
              </span>
              <img
                src={coin.image}
                alt={coin.name}
                className="h-8 w-8 rounded-full"
              />
              <div>
                <h4 className="text-sm font-semibold text-foreground">{coin.name}</h4>
                <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
                  {coin.symbol}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Watchlist star — animated scale on hover, fill when watched */}
              <motion.button
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.15 }}
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleWatch(coin.id)
                }}
                className="rounded-full p-1 transition-colors hover:bg-muted"
              >
                <Star
                  className={cn(
                    "h-5 w-5 transition-colors duration-200",
                    isWatched
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-muted-foreground/60 hover:text-yellow-500"
                  )}
                />
              </motion.button>

              {/* 24h change badge: green for gain, red for loss */}
              <div
                className={cn(
                  "flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
                  isPositive
                    ? "bg-emerald-500/[0.08] text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/[0.08] text-red-600 dark:text-red-400"
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

          {/* Price row with ghost flash animation on price update */}
          <div className="flex items-baseline gap-2">
            <motion.span
              animate={
                flashState === "up"
                  ? { color: "#22c55e", scale: [1, 1.04, 1] }
                  : flashState === "down"
                  ? { color: "#ef4444", scale: [1, 1.04, 1] }
                  : { color: "inherit", scale: 1 }
              }
              transition={{ duration: 0.5 }}
              className="text-xl font-bold tracking-tight text-foreground"
            >
              {formatPrice(coin.current_price)}
            </motion.span>
          </div>

          {/* Interactive Sparkline — 7-day price curve with crosshair tooltip */}
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
                      <div className="rounded-md border border-border bg-card/95 px-2 py-1 text-[10px] text-foreground shadow-xl">
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
  // Pull UI state and actions from Zustand global store
  const {
    watchlist,
    toggleWatchlist,
    isInWatchlist,
    smartFilter,
    searchQuery,
    selectedCoinId,
    setSelectedCoinId,
  } = useAppStore()

  // ── Filtering & Sorting Pipeline ──
  const filtered = (() => {
    if (!coins) return []
    let result = [...coins]

    // 1. Text search by coin name or symbol
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
      )
    }

    // 2. Quick preset filters (mutually exclusive)
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

    // 3. Always pin watchlisted coins to the top of the grid
    return result.sort((a, b) => {
      const aW = watchlist.includes(a.id)
      const bW = watchlist.includes(b.id)
      if (aW && !bW) return -1
      if (!aW && bW) return 1
      return 0
    })
  })()

  // Find the full coin object for the DetailDrawer
  const selectedCoin = coins?.find((c) => c.id === selectedCoinId) ?? null

  // ── Skeleton Loading State ──
  if (isLoading && !coins) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <GlassCard key={i} className="h-[140px] animate-pulse">
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="space-y-1.5">
                  <div className="h-3 w-20 rounded bg-muted" />
                  <div className="h-2 w-10 rounded bg-muted" />
                </div>
              </div>
              <div className="h-6 w-24 rounded bg-muted" />
              <div className="h-10 rounded bg-muted" />
            </div>
          </GlassCard>
        ))}
      </div>
    )
  }

  // ── Empty State (no matches after filtering) ──
  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">No matching assets found</p>
      </div>
    )
  }

  return (
    <>
      {/* Responsive grid: 1 col mobile → 4 cols xl desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((coin, i) => (
          <AssetCard
            key={coin.id}
            coin={coin}
            index={i}
            isWatched={isInWatchlist(coin.id)}
            onToggleWatch={toggleWatchlist}
            onSelectCoin={setSelectedCoinId}
          />
        ))}
      </div>

      {/* DetailDrawer slides up from bottom when a coin is selected */}
      {selectedCoin && (
        <DetailDrawer
          coin={selectedCoin}
          open={!!selectedCoin}
          onOpenChange={(open) => !open && setSelectedCoinId(null)}
        />
      )}
    </>
  )
}

