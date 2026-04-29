"use client"

/**
 * SmartFilter Component
 * - Combines a free-text search input with quick-filter chips
 * - Search: debounced-like live filtering by coin name or symbol
 * - Quick Filters: one-click presets (Gainers >5%, Losers >5%, Top 10, Under $1, Watchlist)
 * - Sort Dropdown: sort by Market Cap, 24h % Change, or Volume
 * - All controls sync with the global Zustand store (persisted to localStorage)
 * - Uses CSS variables for automatic light/dark adaptation
 */

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Sparkles, X, Filter, ArrowUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/lib/store"

// One-click preset filters with semantic icon colors
const quickFilters = [
  { label: "Gainers > 5%", value: "gainers>5", color: "text-emerald-500" },
  { label: "Losers > 5%", value: "losers>5", color: "text-red-500" },
  { label: "Top 10", value: "top10", color: "text-primary" },
  { label: "Under $1", value: "under1", color: "text-amber-500" },
  { label: "Watchlist", value: "watchlist", color: "text-yellow-500" },
]

// Sort options mapped to CoinGecko API order strings
const sortOptions = [
  { label: "Market Cap", value: "market_cap_desc" },
  { label: "24h Change", value: "price_change_24h_desc" },
  { label: "Volume", value: "volume_desc" },
]

export function SmartFilter() {
  // Global Zustand state: search text, active smart filter, sort order
  const {
    searchQuery,
    setSearchQuery,
    smartFilter,
    setSmartFilter,
    sortOption,
    setSortOption,
  } = useAppStore()

  // Local UI state: expand/collapse the quick-filter chip row
  const [showFilters, setShowFilters] = useState(false)

  /** Toggle a quick filter on/off (mutually exclusive) */
  const handleQuickFilter = (value: string) => {
    setSmartFilter(smartFilter === value ? "" : value)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {/* ── Search Input ── */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search coins, symbols, or ask: 'show me gainers over 5%'"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "h-10 pl-10 rounded-xl",
              "border border-border bg-card/60",
              "text-sm text-foreground placeholder:text-muted-foreground/60",
              "focus:border-primary/30 focus:bg-card/80",
              "transition-colors duration-200"
            )}
          />
          {/* Clear search button — appears only when text is present */}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ── Sort Dropdown ── */}
        <div className="relative">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className={cn(
              "h-10 appearance-none rounded-xl px-3 pr-8 text-sm font-medium",
              "border border-border bg-card/60 text-foreground",
              "hover:bg-card/80 transition-colors cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-primary/20"
            )}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ArrowUpDown className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        {/* ── Filters Toggle Button ── */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium transition-colors",
            showFilters
              ? "bg-primary/10 text-primary border border-primary/20"
              : "border border-border bg-card/60 text-muted-foreground hover:text-foreground"
          )}
        >
          <motion.div whileHover={{ scale: 1.15 }} transition={{ duration: 0.15 }}>
            <Filter className="h-4 w-4" />
          </motion.div>
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* ── Quick-Filter Chips (animated expand/collapse) ── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => handleQuickFilter(f.value)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                    smartFilter === f.value
                      ? "bg-primary/10 border border-primary/20 text-foreground"
                      : "border border-border bg-card/40 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Sparkles className={cn("h-3 w-3", f.color)} />
                  {f.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
