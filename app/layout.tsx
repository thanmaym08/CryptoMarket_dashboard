import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { QueryClientProvider } from "@/components/providers/query-client-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "CryptoVault - Premium Crypto Dashboard",
  description: "Track your cryptocurrency portfolio with real-time prices, charts, and analytics",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

/**
 * Root Layout
 * Wraps the entire application with:
 * - ThemeProvider: manages dark/light mode via next-themes (class attribute strategy)
 * - QueryClientProvider: TanStack Query for server-state management
 * - Toaster: Sonner toast notifications
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <QueryClientProvider>
            {children}
          </QueryClientProvider>
        </ThemeProvider>
        <Toaster />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
