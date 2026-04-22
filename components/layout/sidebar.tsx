"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Star,
  Bell,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore, type SidebarView } from "@/lib/store"

const navItems: { id: SidebarView; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "watchlist", label: "Watchlist", icon: Star },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "ai-insights", label: "AI Insights", icon: Sparkles },
]

export function Sidebar() {
  const { sidebarOpen, toggleSidebar, sidebarView, setSidebarView } = useAppStore()

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 220 : 72 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "relative z-40 flex flex-col border-r border-white/[0.05] bg-[#09090b]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6366f1]/20">
          <TrendingUp className="h-5 w-5 text-[#6366f1]" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="whitespace-nowrap text-lg font-bold tracking-tight text-white"
            >
              CryptoVault
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = sidebarView === item.id
          return (
            <button
              key={item.id}
              onClick={() => setSidebarView(item.id)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-white/[0.06] text-white shadow-[0_0_16px_rgba(99,102,241,0.08)]"
                  : "text-zinc-400 hover:bg-white/[0.03] hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  active ? "text-[#6366f1]" : "text-zinc-500 group-hover:text-zinc-300"
                )}
              />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )
        })}
      </nav>

      {/* Toggle */}
      <div className="border-t border-white/[0.05] p-3">
        <button
          onClick={toggleSidebar}
          className="flex h-10 w-full items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-white/[0.03] hover:text-white"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </div>
    </motion.aside>
  )
}
