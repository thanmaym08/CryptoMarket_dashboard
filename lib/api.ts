import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 3000,
    },
  },
});

export interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: null | {
    times: number;
    currency: string;
    percentage: number;
  };
  last_updated: string;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface ApiError {
  status: number;
  message: string;
}

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";

export async function fetchCoinMarkets(
  vsCurrency: string = "usd",
  order: string = "market_cap_desc",
  perPage: number = 50,
  page: number = 1,
  sparkline: boolean = true
): Promise<CoinMarketData[]> {
  const params = new URLSearchParams({
    vs_currency: vsCurrency,
    order,
    per_page: perPage.toString(),
    page: page.toString(),
    sparkline: sparkline.toString(),
    price_change_percentage: "24h",
  });

  const response = await fetch(
    `${COINGECKO_API_URL}/coins/markets?${params.toString()}`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (response.status === 429) {
    const error: ApiError = {
      status: 429,
      message: "Rate limit exceeded. Please try again later.",
    };
    throw error;
  }

  if (!response.ok) {
    const error: ApiError = {
      status: response.status,
      message: `API request failed with status ${response.status}`,
    };
    throw error;
  }

  return response.json();
}
