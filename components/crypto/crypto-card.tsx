"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Star } from "lucide-react"
import { motion } from "framer-motion"
import { Sparkline } from "./sparkline"
import { usePriceFlash } from "@/hooks/usePriceFlash"
import { cn } from "@/lib/utils"
import { CoinMarketData } from "@/lib/api"
import { DetailDrawer } from "./detail-drawer"

interface CryptoCardProps {
  coin: CoinMarketData
  isWatched: boolean
  onToggleWatch: (coinId: string) => void
}

function formatPrice(price: number): string {
  if (price >= 1) {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `$${price.toFixed(6)}`
}

export function CryptoCard({
  coin,
  isWatched,
  onToggleWatch,
}: CryptoCardProps) {
  const isPositive = (coin.price_change_percentage_24h ?? 0) >= 0
  const { flashState } = usePriceFlash(coin.current_price)

  const sparklineData = coin.sparkline_in_7d?.price ?? []

  return (
    <DetailDrawer coin={coin}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        layout
      >
      <Card
        className={cn(
          "group relative cursor-pointer overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-primary/5",
          isWatched && "border-primary/30 bg-primary/5"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
            <img
              src={coin.image}
              alt={coin.name}
              className="h-8 w-8 rounded-full"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{coin.name}</h3>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{coin.symbol}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleWatch(coin.id)
              }}
              className="rounded-full p-1.5 transition-colors hover:bg-secondary"
            >
              <Star
                className={cn(
                  "h-4 w-4 transition-colors",
                  isWatched
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                )}
              />
            </button>
            <div className={cn(
              "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium shrink-0",
              isPositive
                ? "bg-green-500/10 text-green-500"
                : "bg-red-500/10 text-red-500"
            )}>
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {isPositive ? "+" : ""}{(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="relative flex items-baseline gap-2">
            <motion.span
              animate={
                flashState === "up"
                  ? { color: "#22c55e", scale: [1, 1.05, 1] }
                  : flashState === "down"
                  ? { color: "#ef4444", scale: [1, 1.05, 1] }
                  : { color: "#fafafa", scale: 1 }
              }
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold tracking-tight"
            >
              {formatPrice(coin.current_price)}
            </motion.span>
            <span className="text-xs text-muted-foreground">USD</span>
          </div>

          <div className="h-10">
            <Sparkline data={sparklineData} positive={isPositive} />
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </DetailDrawer>
  )
}
