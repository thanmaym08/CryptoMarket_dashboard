"use client"

import { QueryClientProvider as TanStackQueryClientProvider } from "@tanstack/react-query"
import { ReactNode } from "react"
import { queryClient } from "@/lib/api"

export function QueryClientProvider({ children }: { children: ReactNode }) {
  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
    </TanStackQueryClientProvider>
  )
}
