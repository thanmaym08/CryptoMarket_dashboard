"use client"

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

function formatPrice(price: number): string {
  if (price >= 1) {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `$${price.toFixed(6)}`
}

export function HeroCard({ coin }: HeroCardProps) {
  if (!coin) {
    return (
      <GlassCard className="col-span-12 lg:col-span-8 h-[340px] animate-pulse-glow">
        <div className="flex h-full items-center justify-center">
          <div className="text-zinc-500">Loading market leader...</div>
        </div>
      </GlassCard>
    )
  }

  const isPositive = (coin.price_change_percentage_24h ?? 0) >= 0
  const sparklineData =
    coin.sparkline_in_7d?.price.map((p, i) => ({
      time: i,
      price: p,
    })) ?? []

  return (
    <GlassCard className="col-span-12 lg:col-span-8 h-[340px] animate-pulse-glow">
      <div className="flex h-full flex-col p-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.05]">
              <img src={coin.image} alt={coin.name} className="h-9 w-9 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white">{coin.name}</h2>
                <span className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-xs font-medium text-zinc-400 uppercase">
                  {coin.symbol}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-xs text-amber-400/80">Trending #1</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold tracking-tight text-white">
              {formatPrice(coin.current_price)}
            </div>
            <div
              className={cn(
                "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                isPositive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              )}
            >
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isPositive ? "+" : ""}
              {(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Chart */}
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

        {/* Bottom stats */}
        <div className="mt-2 flex items-center gap-6 border-t border-white/[0.04] pt-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">24h High</p>
            <p className="text-sm font-semibold text-zinc-300">{formatPrice(coin.high_24h)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">24h Low</p>
            <p className="text-sm font-semibold text-zinc-300">{formatPrice(coin.low_24h)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Market Cap</p>
            <p className="text-sm font-semibold text-zinc-300">
              ${(coin.market_cap / 1e9).toFixed(2)}B
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Volume</p>
            <p className="text-sm font-semibold text-zinc-300">
              ${(coin.total_volume / 1e9).toFixed(2)}B
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
