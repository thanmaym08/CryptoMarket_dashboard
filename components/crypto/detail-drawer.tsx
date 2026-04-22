"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { CoinMarketData } from "@/lib/api";
import { TrendingUp, TrendingDown, BarChart3, Hash, DollarSign } from "lucide-react";
import { Sparkline } from "./sparkline";

interface DetailDrawerProps {
  coin: CoinMarketData;
  children: React.ReactNode;
}

function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "N/A";
  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(2)}M`;
  }
  return `$${num.toLocaleString()}`;
}

function formatPrice(price: number): string {
  if (price >= 1) {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${price.toFixed(6)}`;
}

export function DetailDrawer({ coin, children }: DetailDrawerProps) {
  const isPositive = (coin.price_change_percentage_24h ?? 0) >= 0;
  const sparklineData = coin.sparkline_in_7d?.price ?? [];

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="border-border/50 bg-card">
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
          <DrawerDescription className="sr-only">
            Detailed market data and metrics for {coin.name} ({coin.symbol.toUpperCase()})
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-8 space-y-6">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">
              {formatPrice(coin.current_price)}
            </span>
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                isPositive
                  ? "bg-green-500/10 text-green-500"
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {isPositive ? "+" : ""}
              {(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
            </span>
          </div>

          <div className="h-16">
            <Sparkline data={sparklineData} positive={isPositive} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border/50 bg-secondary/50 p-4 space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                24h High
              </div>
              <p className="text-lg font-semibold">
                {formatPrice(coin.high_24h)}
              </p>
            </div>

            <div className="rounded-lg border border-border/50 bg-secondary/50 p-4 space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingDown className="h-3 w-3" />
                24h Low
              </div>
              <p className="text-lg font-semibold">
                {formatPrice(coin.low_24h)}
              </p>
            </div>

            <div className="rounded-lg border border-border/50 bg-secondary/50 p-4 space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Hash className="h-3 w-3" />
                Circulating Supply
              </div>
              <p className="text-lg font-semibold">
                {coin.circulating_supply
                  ? coin.circulating_supply.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })
                  : "N/A"}
              </p>
            </div>

            <div className="rounded-lg border border-border/50 bg-secondary/50 p-4 space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                Market Cap
              </div>
              <p className="text-lg font-semibold">
                {formatNumber(coin.market_cap)}
              </p>
            </div>

            <div className="rounded-lg border border-border/50 bg-secondary/50 p-4 space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <BarChart3 className="h-3 w-3" />
                Volume (24h)
              </div>
              <p className="text-lg font-semibold">
                {formatNumber(coin.total_volume)}
              </p>
            </div>

            <div className="rounded-lg border border-border/50 bg-secondary/50 p-4 space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Hash className="h-3 w-3" />
                Rank
              </div>
              <p className="text-lg font-semibold">#{coin.market_cap_rank}</p>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
