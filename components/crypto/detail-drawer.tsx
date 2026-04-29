"use client"

/**
 * DetailDrawer Component
 * - Slides up from bottom (Shadcn/UI Drawer) showing deep metrics for a coin
 * - Displays: price, 24h % change, 7-day sparkline, 24h High/Low
 *   Market Cap, Volume, Circulating Supply, and Rank
 * - Can be triggered via DrawerTrigger (child button) OR controlled
 *   programmatically by passing `open` + `onOpenChange` props
 * - Uses CSS variables for automatic light/dark theme adaptation
 */

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { CoinMarketData } from "@/lib/api"
import { TrendingUp, TrendingDown, BarChart3, Hash, DollarSign } from "lucide-react"
import { Sparkline } from "./sparkline"
import { cn } from "@/lib/utils"

interface DetailDrawerProps {
  coin: CoinMarketData
  children?: React.ReactNode
  /** Controlled open state (used when opened programmatically from AssetCard click) */
  open?: boolean
  /** Callback fired when the drawer requests to close */
  onOpenChange?: (open: boolean) => void
}

/** Compact formatter: B = billion, M = million, raw otherwise */
function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "N/A"
  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(2)}B`
  }
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(2)}M`
  }
  return `$${num.toLocaleString()}`
}

/** Formats a USD price: 2 decimals above $1, 6 decimals below */
function formatPrice(price: number): string {
  if (price >= 1) {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `$${price.toFixed(6)}`
}

export function DetailDrawer({ coin, children, open, onOpenChange }: DetailDrawerProps) {
  const isPositive = (coin.price_change_percentage_24h ?? 0) >= 0
  const sparklineData = coin.sparkline_in_7d?.price ?? []

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {/* Only render trigger when children are provided (inline usage) */}
      {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}

      <DrawerContent className="border-border/50 bg-card text-card-foreground">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-3">
            <img
              src={coin.image}
              alt={coin.name}
              className="h-8 w-8 rounded-full"
            />
            <span>{coin.name}</span>
            <span className="text-sm font-normal text-muted-foreground uppercase">
              {coin.symbol}
            </span>
          </DrawerTitle>
          {/* Accessible description hidden visually but read by screen readers */}
          <DrawerDescription className="sr-only">
            Detailed market data and metrics for {coin.name} ({coin.symbol.toUpperCase()})
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-8 space-y-6">
          {/* Price + 24h change badge */}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {formatPrice(coin.current_price)}
            </span>
            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                isPositive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              )}
            >
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isPositive ? "+" : ""}
              {(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
            </span>
          </div>

          {/* Mini sparkline */}
          <div className="h-16">
            <Sparkline data={sparklineData} positive={isPositive} />
          </div>

          {/* Metric grid: 2 columns on mobile, adaptive on larger screens */}
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              icon={<TrendingUp className="h-3 w-3" />}
              label="24h High"
              value={formatPrice(coin.high_24h)}
            />
            <MetricCard
              icon={<TrendingDown className="h-3 w-3" />}
              label="24h Low"
              value={formatPrice(coin.low_24h)}
            />
            <MetricCard
              icon={<Hash className="h-3 w-3" />}
              label="Circulating Supply"
              value={
                coin.circulating_supply
                  ? coin.circulating_supply.toLocaleString(undefined, { maximumFractionDigits: 0 })
                  : "N/A"
              }
            />
            <MetricCard
              icon={<DollarSign className="h-3 w-3" />}
              label="Market Cap"
              value={formatNumber(coin.market_cap)}
            />
            <MetricCard
              icon={<BarChart3 className="h-3 w-3" />}
              label="Volume (24h)"
              value={formatNumber(coin.total_volume)}
            />
            <MetricCard
              icon={<Hash className="h-3 w-3" />}
              label="Rank"
              value={`#${coin.market_cap_rank}`}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

/** Reusable metric tile used inside the DetailDrawer grid */
function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-secondary/50 p-4 space-y-1">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}
