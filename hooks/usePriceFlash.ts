"use client";

import { useRef, useEffect, useState } from "react";

type FlashState = "up" | "down" | "neutral";

export function usePriceFlash(
  currentPrice: number,
  flashDuration: number = 1000
): { flashState: FlashState } {
  const prevPriceRef = useRef<number>(currentPrice);
  const [flashState, setFlashState] = useState<FlashState>("neutral");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const prevPrice = prevPriceRef.current;

    if (prevPrice !== currentPrice) {
      if (currentPrice > prevPrice) {
        setFlashState("up");
      } else if (currentPrice < prevPrice) {
        setFlashState("down");
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setFlashState("neutral");
      }, flashDuration);

      prevPriceRef.current = currentPrice;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentPrice, flashDuration]);

  return { flashState };
}
