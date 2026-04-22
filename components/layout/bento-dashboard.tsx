"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Sparkles } from "lucide-react"
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
  const [isRateLimited, setIsRateLimited] = useState(false)
  const { sidebarView } = useAppStore()

  const {
    data: coins,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["coinMarkets", "market_cap_desc"],
    queryFn: () => fetchCoinMarkets("usd", "market_cap_desc"),
    refetchInterval: isRateLimited ? false : 5000,
    placeholderData: (previousData) => previousData,
    retry: (failureCount, error: any) => {
      if (error?.status === 429) return false
      return failureCount < 3
    },
  })

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

  const heroCoin = coins?.[0]

  return (
    <div className="flex h-screen overflow-hidden bg-[#09090b]">
      <MouseLightLeak />

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Pulse Bar */}
        <PulseBar />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-[1600px] space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  {sidebarView === "dashboard" && "Market Overview"}
                  {sidebarView === "watchlist" && "Your Watchlist"}
                  {sidebarView === "alerts" && "Price Alerts"}
                  {sidebarView === "ai-insights" && "AI Insights"}
                </h1>
                <p className="mt-1 text-sm text-zinc-500">
                  {sidebarView === "dashboard" && "Live prices and 24h performance"}
                  {sidebarView === "watchlist" && "Assets you're tracking"}
                  {sidebarView === "alerts" && "Coming soon — set custom price alerts"}
                  {sidebarView === "ai-insights" && "AI-powered market analysis"}
                </p>
              </div>
              {coins && (
                <div className="text-xs text-zinc-600">
                  {coins.length} assets tracked
                </div>
              )}
            </div>

            {/* Bento Grid */}
            {sidebarView === "dashboard" && (
              <>
                {/* Hero Row */}
                <div className="grid grid-cols-12 gap-4">
                  <HeroCard coin={heroCoin} />
                  <AiPulse coins={coins} isLoading={isLoading} />
                </div>

                {/* Filter Bar */}
                <SmartFilter />

                {/* Asset Grid */}
                <AssetGrid coins={coins} isLoading={isLoading} />
              </>
            )}

            {sidebarView === "watchlist" && (
              <>
                <SmartFilter />
                <AssetGrid coins={coins} isLoading={isLoading} />
              </>
            )}

            {sidebarView === "alerts" && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] py-32">
                <div className="h-16 w-16 rounded-full bg-white/[0.03] flex items-center justify-center">
                  <svg className="h-7 w-7 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-zinc-400">Price Alerts</h3>
                <p className="mt-1 text-sm text-zinc-600">Set custom notifications for price movements</p>
              </div>
            )}

            {sidebarView === "ai-insights" && (
              <>
                <div className="grid grid-cols-12 gap-4">
                  <AiPulse coins={coins} isLoading={isLoading} />
                  <div className="col-span-12 lg:col-span-8 h-[340px]">
                    <div className="glass-card rounded-xl h-full flex items-center justify-center">
                      <div className="text-center">
                        <Sparkles className="h-8 w-8 text-[#6366f1] mx-auto mb-3 animate-pulse" />
                        <h3 className="text-lg font-semibold text-white">Deep AI Analysis</h3>
                        <p className="mt-1 text-sm text-zinc-500">Advanced pattern recognition and sentiment analysis</p>
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
