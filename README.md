# CryptoVault — AI-Native Crypto Workspace

A production-grade cryptocurrency market dashboard built as a **Bento Grid workspace** with real-time data polling, AI-powered market insights, glassmorphic UI, and advanced micro-interactions.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-38B2AC?logo=tailwind-css)

## What It Does

CryptoVault transforms raw CoinGecko market data into an immersive trading workspace:

- **Live Market Overview** — Real-time prices updating every 5 seconds with ghost price flashing
- **AI Market Pulse** — Auto-generated trade signals from top gainers/losers and market sentiment
- **Interactive Hero Chart** — Crosshair-enabled area chart for the #1 trending coin
- **Semantic Asset Grid** — Cards glow red when crashing (>8% drop) or green when surging, with crosshair sparklines
- **Smart Filter Bar** — Quick filters: "Gainers > 5%", "Under $1", "Watchlist", etc.
- **Persistent Watchlist** — Star coins; they pin to top and survive refreshes
- **Mouse Light Leak** — Cursor-tracking radial glow across the deep space dark canvas
- **Detail Drawers** — Click any asset for deep metrics (24h High/Low, Market Cap, Volume, Rank)

## Architecture

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16.2 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 + custom Deep Space theme |
| **State** | Zustand + persist middleware |
| **Data** | TanStack Query — 5s polling, stale-while-revalidate |
| **Animations** | Framer Motion |
| **Charts** | Recharts (interactive area charts + sparklines) |
| **UI Kit** | Shadcn/UI (customized) |
| **API** | CoinGecko Public API |

## Key Features

### Real-Time Polling
- Queries CoinGecko every **5 seconds** with `placeholderData` to prevent layout shift
- **Rate-limit resilient**: detects HTTP 429, stops polling, shows toast, auto-resumes after 30s

### Ghost Price Flashing
- Green flash + scale pulse on price up
- Red flash + scale pulse on price down
- Shimmer sweep across card surface

### AI Market Pulse (Simulated)
Generates contextual signals from live data:
- Top gainer momentum alerts
- Support-break warnings for losers
- Broad market rally/selloff detection

### Semantic Grid Sizing
- **> +8%** → Green glow (`shadow-emerald-500/12`)
- **< -8%** → Red glow (`shadow-red-500/12`)
- Staggered entrance animations

### Deep Space Dark Mode
Custom palette on `zinc-950` (`#09090b`):
- Cards: `bg-white/[0.03]` + `backdrop-blur-2xl` + `border-white/[0.05]`
- Accent: Indigo (`#6366f1`)

## Getting Started

```bash
git clone https://github.com/thanmaym08/CryptoMarket_dashboard.git
cd CryptoMarket_dashboard
pnpm install
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001)

## Build for Production

```bash
pnpm build
```

## Project Structure

```
app/
├── page.tsx                 → Entry point
├── layout.tsx               → Root layout with providers
├── globals.css              → Deep Space theme + animations

components/
├── layout/
│   ├── bento-dashboard.tsx  → Main orchestrator
│   ├── sidebar.tsx          → Collapsible nav
│   └── pulse-bar.tsx        → Top stats bar
├── crypto/
│   ├── hero-card.tsx        → #1 coin chart
│   ├── ai-pulse.tsx         → AI signals panel
│   ├── asset-grid.tsx       → Semantic card grid
│   ├── smart-filter.tsx     → Search + filters
│   ├── crypto-card.tsx      → Individual card
│   └── detail-drawer.tsx    → Metrics drawer
├── ui/
│   ├── glass-card.tsx       → Reusable glass card
│   └── mouse-light-leak.tsx → Cursor glow effect

lib/
├── api.ts                   → CoinGecko client
├── store.ts                 → Zustand global state
└── utils.ts                 → Tailwind cn() helper

hooks/
├── usePriceFlash.ts         → Price flash animation
├── useWatchlist.ts          → Watchlist persistence
└── useDebounce.ts           → Debounced search
```

## API

Powered by [CoinGecko API v3](https://www.coingecko.com/en/api) (`/coins/markets`).
No API key required for public endpoints.

## License

MIT — built for demonstration and portfolio purposes.
