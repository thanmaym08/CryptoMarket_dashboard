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
      sidebarOpen: true,
      sidebarView: "dashboard",
      theme: "dark",
      searchQuery: "",
      watchlist: [],
      selectedCoinId: null,
      sortOption: "market_cap_desc",
      smartFilter: "",

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarView: (view) => set({ sidebarView: view }),
      setTheme: (theme) => set({ theme }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      toggleWatchlist: (coinId) =>
        set((state) => ({
          watchlist: state.watchlist.includes(coinId)
            ? state.watchlist.filter((id) => id !== coinId)
            : [coinId, ...state.watchlist],
        })),
      isInWatchlist: (coinId) => get().watchlist.includes(coinId),
      setSelectedCoinId: (id) => set({ selectedCoinId: id }),
      setSortOption: (option) => set({ sortOption: option }),
      setSmartFilter: (filter) => set({ smartFilter: filter }),
    }),
    {
      name: "cryptovault-store",
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
