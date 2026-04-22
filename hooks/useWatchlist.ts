"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "crypto-watchlist";

export function useWatchlist(): {
  watchlist: string[];
  toggleWatch: (coinId: string) => void;
  isWatched: (coinId: string) => boolean;
} {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    }
  }, [watchlist]);

  const toggleWatch = useCallback((coinId: string) => {
    setWatchlist((prev) => {
      if (prev.includes(coinId)) {
        return prev.filter((id) => id !== coinId);
      }
      return [coinId, ...prev];
    });
  }, []);

  const isWatched = useCallback(
    (coinId: string) => watchlist.includes(coinId),
    [watchlist]
  );

  return { watchlist, toggleWatch, isWatched };
}
