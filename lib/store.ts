/**
 * Zustand Global Store (with Persistence)
 * ======================================
 * Single source of truth for UI state that must survive across renders
 * and persist to localStorage so preferences are remembered on reload.
 *
 * Persisted fields (written to localStorage key "cryptovault-store"):
 *   - sidebarOpen   : whether the sidebar is expanded or collapsed
 *   - sidebarView   : active navigation tab (dashboard | watchlist | alerts | ai-insights)
 *   - theme         : light / dark / system (currently managed by next-themes, kept for reference)
 *   - watchlist     : array of CoinGecko coin IDs the user has starred
 *   - sortOption    : current sort order string passed to the API (market_cap_desc, etc.)
 *
 * Ephemeral fields (NOT persisted):
 *   - searchQuery   : live text in the search bar
 *   - selectedCoinId: currently opened coin in the DetailDrawer
 *   - smartFilter   : active quick-filter preset (gainers>5, losers>5, etc.)
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type SidebarView = "dashboard" | "watchlist" | "alerts" | "ai-insights"
export type ThemeMode = "dark" | "light" | "system"

interface AppState {
  sidebarOpen: boolean
  sidebarView: SidebarView
  theme: ThemeMode
  searchQuery: string
  watchlist: string[]
  selectedCoinId: string | null
  sortOption: string
  smartFilter: string

  // ── Actions ──
  toggleSidebar: () => void
  setSidebarView: (view: SidebarView) => void
  setTheme: (theme: ThemeMode) => void
  setSearchQuery: (query: string) => void
  toggleWatchlist: (coinId: string) => void
  isInWatchlist: (coinId: string) => boolean
  setSelectedCoinId: (id: string | null) => void
  setSortOption: (option: string) => void
  setSmartFilter: (filter: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Defaults ──
      sidebarOpen: true,
      sidebarView: "dashboard",
      theme: "dark",
      searchQuery: "",
      watchlist: [],
      selectedCoinId: null,
      sortOption: "market_cap_desc",
      smartFilter: "",

      // ── Action Implementations ──
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarView: (view) => set({ sidebarView: view }),
      setTheme: (theme) => set({ theme }),
      setSearchQuery: (query) => set({ searchQuery: query }),

      /** Adds/removes a coin ID from the watchlist array (immutable update) */
      toggleWatchlist: (coinId) =>
        set((state) => ({
          watchlist: state.watchlist.includes(coinId)
            ? state.watchlist.filter((id) => id !== coinId)
            : [coinId, ...state.watchlist],
        })),

      /** Derives whether a given coin ID is currently watched */
      isInWatchlist: (coinId) => get().watchlist.includes(coinId),

      setSelectedCoinId: (id) => set({ selectedCoinId: id }),
      setSortOption: (option) => set({ sortOption: option }),
      setSmartFilter: (filter) => set({ smartFilter: filter }),
    }),
    {
      name: "cryptovault-store",
      /** Only persist the fields listed here to localStorage */
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        sidebarView: state.sidebarView,
        theme: state.theme,
        watchlist: state.watchlist,
        sortOption: state.sortOption,
      }),
    }
  )
)
