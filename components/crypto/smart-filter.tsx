"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Sparkles, X, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/lib/store"

const quickFilters = [
  { label: "Gainers > 5%", value: "gainers>5", color: "text-emerald-400" },
  { label: "Losers > 5%", value: "losers>5", color: "text-red-400" },
  { label: "Top 10", value: "top10", color: "text-[#6366f1]" },
  { label: "Under $1", value: "under1", color: "text-amber-400" },
  { label: "Watchlist", value: "watchlist", color: "text-yellow-400" },
]

export function SmartFilter() {
  const { searchQuery, setSearchQuery, smartFilter, setSmartFilter } = useAppStore()
  const [showFilters, setShowFilters] = useState(false)

  const handleQuickFilter = (value: string) => {
    if (smartFilter === value) {
      setSmartFilter("")
    } else {
      setSmartFilter(value)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            type="text"
            placeholder="Search coins, symbols, or ask: 'show me gainers over 5%'"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "h-10 pl-10 border-white/[0.05] bg-white/[0.03]",
              "text-sm text-zinc-300 placeholder:text-zinc-600",
              "focus:border-[#6366f1]/30 focus:bg-white/[0.05]",
              "rounded-xl"
            )}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium transition-colors",
            showFilters
              ? "bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/20"
              : "border border-white/[0.05] bg-white/[0.03] text-zinc-400 hover:text-white"
          )}
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

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
                      ? "bg-white/[0.08] border border-white/[0.08] text-white"
                      : "border border-white/[0.04] bg-white/[0.02] text-zinc-500 hover:text-zinc-300"
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
