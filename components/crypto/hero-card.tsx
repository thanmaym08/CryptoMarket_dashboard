"use client"

/**
 * HeroCard Component
 * - Displays the #1 ranked cryptocurrency in a large "hero" bento tile
 * - Contains: coin identity (logo, name, symbol), current price, 24h % change
 * - Interactive Recharts AreaChart with crosshair tooltip
 * - Bottom row shows 24h High/Low, Market Cap, and Volume
 * - Uses CSS variables so text and borders adapt to light/dark mode
 */

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Flame } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { CoinMarketData } from "@/lib/api"
import { cn } from "@/lib/utils"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts"

interface HeroCardProps {
  coin: CoinMarketData | undefined
}

/** Formats a USD price: shows 2 decimals above $1, 6 decimals below */
function formatPrice(price: number): string {
  if (price >= 1) {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `$${price.toFixed(6)}`
}

export function HeroCard({ coin }: HeroCardProps) {
  // Loading skeleton state while CoinGecko data is fetching
  if (!coin) {
    return (
      <GlassCard className="col-span-12 lg:col-span-8 h-[340px] animate-pulse-glow">
        <div className="flex h-full items-center justify-center">
          <div className="text-muted-foreground animate-pulse">Loading market leader...</div>
        </div>
      </GlassCard>
    )
  }

  const isPositive = (coin.price_change_percentage_24h ?? 0) >= 0

  // Build chart data array from the 7-day sparkline price series
  const sparklineData =
    coin.sparkline_in_7d?.price.map((p, i) => ({
      time: i,
      price: p,
    })) ?? []

  return (
    <GlassCard className="col-span-12 lg:col-span-8 h-[340px] animate-pulse-glow">
      <div className="flex h-full flex-col p-5">
        {/* ── Top Row: Coin Identity + Price ── */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <img src={coin.image} alt={coin.name} className="h-9 w-9 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-foreground">{coin.name}</h2>
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground uppercase">
                  {coin.symbol}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Flame className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs text-amber-500/80">Trending #1</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {formatPrice(coin.current_price)}
            </div>
            {/* 24h change badge: green background for gainers, red for losers */}
            <div
              className={cn(
                "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                isPositive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              )}
            >
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isPositive ? "+" : ""}
              {(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
            </div>
          </div>
        </div>

        {/* ── Interactive Chart ── */}
        <div className="mt-4 flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <Tooltip
                contentStyle={{
                  background: "rgba(9,9,11,0.9)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#fafafa",
                }}
                formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "Price"]}
                labelStyle={{ display: "none" }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#heroGradient)"
                dot={false}
                isAnimationActive={true}
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ── Bottom Stats Row ── */}
        <div className="mt-2 flex items-center gap-6 border-t border-border pt-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">24h High</p>
            <p className="text-sm font-semibold text-foreground">{formatPrice(coin.high_24h)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">24h Low</p>
            <p className="text-sm font-semibold text-foreground">{formatPrice(coin.low_24h)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Market Cap</p>
            <p className="text-sm font-semibold text-foreground">
              ${(coin.market_cap / 1e9).toFixed(2)}B
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Volume</p>
            <p className="text-sm font-semibold text-foreground">
              ${(coin.total_volume / 1e9).toFixed(2)}B
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
