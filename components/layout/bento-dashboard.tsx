"use client"

/**
 * BentoDashboard — Main Application Orchestrator
 * ------------------------------------------------
 * This is the root layout component that stitches together:
 * 1. Sidebar       → Collapsible navigation (left)
 * 2. PulseBar      → Sticky top stats bar (global mcap, fear/greed, AI sentiment)
 * 3. HeroCard      → Massive interactive chart for #1 coin
 * 4. AiPulse       → AI-generated market signals panel
 * 5. SmartFilter   → Search + quick-filter chips
 * 6. AssetGrid     → Responsive grid of coin cards with sparklines
 *
 * Data Flow:
 * - TanStack Query polls CoinGecko every 5s (paused on 429 rate-limit)
 * - Zustand store holds UI state (sidebar, watchlist, theme, filters)
 * - Watchlist is persisted to localStorage via Zustand middleware
 *
 * Theme Support:
 * - Uses `bg-background` / `text-foreground` CSS variables
 * - next-themes toggles the `.dark` class on <html>
 */

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Sparkles, Bell } from "lucide-react"
import { Sidebar } from "./sidebar"
import { PulseBar } from "./pulse-bar"
import { HeroCard } from "@/components/crypto/hero-card"
import { AiPulse } from "@/components/crypto/ai-pulse"
import { SmartFilter } from "@/components/crypto/smart-filter"
import { AssetGrid } from "@/components/crypto/asset-grid"
import { MouseLightLeak } from "@/components/ui/mouse-light-leak"
import { fetchCoinMarkets } from "@/lib/api"
import { useAppStore } from "@/lib/store"

export function BentoDashboard() {
  // Rate-limit state: stops polling when CoinGecko returns HTTP 429
  const [isRateLimited, setIsRateLimited] = useState(false)
  // Track last successful fetch timestamp for the "last updated" indicator
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Read the active sidebar view + sort order from global Zustand store
  const { sidebarView, sortOption } = useAppStore()

  // TanStack Query: fetch CoinGecko markets, re-poll every 5 seconds
  // queryKey includes sortOption so React Query auto-refetches when user changes sort
  const {
    data: coins,
    isLoading,
    isError,
    error,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["coinMarkets", sortOption],
    queryFn: () => fetchCoinMarkets("usd", sortOption),
    refetchInterval: isRateLimited ? false : 5000,
    placeholderData: (previousData) => previousData,
    retry: (failureCount, error: any) => {
      if (error?.status === 429) return false
      return failureCount < 3
    },
  })

  // Record timestamp whenever fresh data arrives
  useEffect(() => {
    if (dataUpdatedAt) setLastUpdated(new Date(dataUpdatedAt))
  }, [dataUpdatedAt])

  // Rate-limit recovery: detect 429, show toast, auto-resume after 30s
  useEffect(() => {
    if (isError && (error as any)?.status === 429 && !isRateLimited) {
      setIsRateLimited(true)
      toast.error("Service Busy", {
        description: "Rate limit reached. Resuming in 30 seconds...",
      })
      const timer = setTimeout(() => {
        setIsRateLimited(false)
        toast.success("Resuming updates", {
          description: "Real-time data polling restarted.",
        })
      }, 30000)
      return () => clearTimeout(timer)
    }
  }, [isError, error, isRateLimited])

  // The #1 coin (highest market cap) gets the Hero Card treatment
  const heroCoin = coins?.[0]

  return (
    // Main shell uses CSS variables so it adapts to light/dark mode
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Mouse-following radial glow — adapts opacity via CSS vars */}
      <MouseLightLeak />

      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Sticky top stats bar */}
        <PulseBar />

        {/* Scrollable main canvas */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-[1600px] space-y-6">
            {/* Page Header: title + subtitle + last-updated timestamp */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {sidebarView === "dashboard" && "Market Overview"}
                  {sidebarView === "watchlist" && "Your Watchlist"}
                  {sidebarView === "alerts" && "Price Alerts"}
                  {sidebarView === "ai-insights" && "AI Insights"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {sidebarView === "dashboard" && "Live prices and 24h performance"}
                  {sidebarView === "watchlist" && "Assets you're tracking"}
                  {sidebarView === "alerts" && "Coming soon — set custom price alerts"}
                  {sidebarView === "ai-insights" && "AI-powered market analysis"}
                </p>
              </div>
              {/* Right-side metadata: asset count + last poll timestamp */}
              {coins && (
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-xs text-muted-foreground">
                    {coins.length} assets tracked
                  </span>
                  {lastUpdated && (
                    <span className="text-[10px] text-muted-foreground/70">
                      Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* ───────────────── DASHBOARD VIEW ───────────────── */}
            {sidebarView === "dashboard" && (
              <>
                {/* Hero Row: massive chart (#1 coin) + AI signals panel */}
                <div className="grid grid-cols-12 gap-4">
                  <HeroCard coin={heroCoin} />
                  <AiPulse coins={coins} isLoading={isLoading} />
                </div>

                {/* Search + Filter chips */}
                <SmartFilter />

                {/* Responsive asset card grid */}
                <AssetGrid coins={coins} isLoading={isLoading} />
              </>
            )}

            {/* ───────────────── WATCHLIST VIEW ───────────────── */}
            {sidebarView === "watchlist" && (
              <>
                <SmartFilter />
                <AssetGrid coins={coins} isLoading={isLoading} />
              </>
            )}

            {/* ───────────────── ALERTS VIEW (placeholder) ───────────────── */}
            {sidebarView === "alerts" && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-32">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <Bell className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-muted-foreground">Price Alerts</h3>
                <p className="mt-1 text-sm text-muted-foreground/80">Set custom notifications for price movements</p>
              </div>
            )}

            {/* ───────────────── AI INSIGHTS VIEW ───────────────── */}
            {sidebarView === "ai-insights" && (
              <>
                <div className="grid grid-cols-12 gap-4">
                  <AiPulse coins={coins} isLoading={isLoading} />
                  <div className="col-span-12 lg:col-span-8 h-[340px]">
                    <div className="glass-card rounded-xl h-full flex items-center justify-center">
                      <div className="text-center">
                        <Sparkles className="h-8 w-8 text-primary mx-auto mb-3 animate-pulse" />
                        <h3 className="text-lg font-semibold text-foreground">Deep AI Analysis</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Advanced pattern recognition and sentiment analysis</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
