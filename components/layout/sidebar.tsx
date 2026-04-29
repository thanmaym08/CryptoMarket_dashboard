"use client"

/**
 * Sidebar Component
 * - Provides collapsible left navigation with animated width transitions
 * - Contains 4 views: Dashboard, Watchlist, Alerts, AI Insights
 * - Includes a Theme Toggle (Sun/Moon) for dark/light mode switching
 * - Icons are animated: they scale + brighten on hover for tactile feedback
 * - Syncs active view state via Zustand global store (persisted to localStorage)
 *
 * NOTE: The theme toggle icon is only rendered after client mount to avoid
 * a React hydration mismatch (server doesn't know the user's saved preference).
 */

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Star,
  Bell,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sun,
  Moon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useAppStore, type SidebarView } from "@/lib/store"

// Navigation items mapped to sidebar views + Lucide icons
const navItems: { id: SidebarView; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "watchlist", label: "Watchlist", icon: Star },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "ai-insights", label: "AI Insights", icon: Sparkles },
]

export function Sidebar() {
  // Zustand state: sidebar width + active navigation view
  const { sidebarOpen, toggleSidebar, sidebarView, setSidebarView } = useAppStore()

  // next-themes hook to read and toggle the current theme
  const { theme, setTheme } = useTheme()

  // mounted = false during SSR, true after first client effect
  // Used to suppress hydration mismatch on the theme toggle icon
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 220 : 72 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "relative z-40 flex flex-col border-r border-sidebar-border bg-sidebar"
      )}
    >
      {/* Logo Section — fixed height, brand icon + animated text reveal */}
      <div className="flex h-16 items-center gap-3 px-5">
        {/* Brand icon container with subtle indigo glow */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20">
          <TrendingUp className="h-6 w-6 text-primary" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="whitespace-nowrap text-lg font-bold tracking-tight text-sidebar-foreground"
            >
              CryptoVault
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Items — each button has icon + animated label */}
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
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_0_16px_rgba(99,102,241,0.08)]"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              {/*
                Icon with dynamic hover:
                - scales up 1.15x on hover for tactile feel
                - brightens color when hovered (zinc-500 -> zinc-200)
                - active state turns indigo (#6366f1)
              */}
              <motion.div whileHover={{ scale: 1.15 }} transition={{ duration: 0.2 }}>
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors duration-200",
                    active ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground"
                  )}
                />
              </motion.div>
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

      {/* Bottom Controls: Theme Toggle + Collapse Toggle */}
      <div className="space-y-2 border-t border-sidebar-border p-3">
        {/* Theme Toggle — cycles dark / light
          Only renders the icon after mount to avoid hydration mismatch
          (server doesn't know the user's saved theme preference). */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="group flex h-10 w-full items-center justify-center gap-2 rounded-xl text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        >
          <motion.div whileHover={{ scale: 1.2, rotate: 15 }} transition={{ duration: 0.25 }}>
            {mounted ? (
              theme === "dark" ? (
                <Sun className="h-5 w-5 transition-colors" />
              ) : (
                <Moon className="h-5 w-5 transition-colors" />
              )
            ) : (
              /* Placeholder div matching icon dimensions to prevent layout shift */
              <div className="h-5 w-5" />
            )}
          </motion.div>
          <AnimatePresence>
            {sidebarOpen && mounted && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap text-xs font-medium"
              >
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Collapse / Expand toggle */}
        <button
          onClick={toggleSidebar}
          className="flex h-10 w-full items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        >
          <motion.div whileHover={{ scale: 1.2 }} transition={{ duration: 0.2 }}>
            {sidebarOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </motion.div>
        </button>
      </div>
    </motion.aside>
  )
}
