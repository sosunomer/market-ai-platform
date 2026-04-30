import type { PlanFeatureMap } from "@/types";

/**
 * Abonelik planı özellikleri.
 */
export const PLAN_FEATURES: PlanFeatureMap = {
  free: {
    maxPortfolios: 1,
    maxAlerts: 3,
    maxWatchlistItems: 10,
    aiAnalysisPerDay: 3,
    realTimeData: false,
    advancedCharts: false,
    politicianTracking: false,
    exportData: false,
    prioritySupport: false,
  },
  basic: {
    maxPortfolios: 3,
    maxAlerts: 10,
    maxWatchlistItems: 30,
    aiAnalysisPerDay: 15,
    realTimeData: true,
    advancedCharts: false,
    politicianTracking: false,
    exportData: false,
    prioritySupport: false,
  },
  pro: {
    maxPortfolios: 10,
    maxAlerts: 50,
    maxWatchlistItems: 100,
    aiAnalysisPerDay: 50,
    realTimeData: true,
    advancedCharts: true,
    politicianTracking: true,
    exportData: true,
    prioritySupport: false,
  },
  enterprise: {
    maxPortfolios: -1,
    maxAlerts: -1,
    maxWatchlistItems: -1,
    aiAnalysisPerDay: -1,
    realTimeData: true,
    advancedCharts: true,
    politicianTracking: true,
    exportData: true,
    prioritySupport: true,
  },
};

/**
 * Finnhub API sabitleri.
 */
export const FINNHUB = {
  BASE_URL: "https://finnhub.io/api/v1",
  WS_URL: "wss://ws.finnhub.io",
} as const;

/**
 * Cache TTL süreleri (saniye).
 */
export const CACHE_TTL = {
  STOCK_QUOTE: 15,
  STOCK_PROFILE: 3600,
  NEWS: 300,
  MARKET_SUMMARY: 60,
  AI_ANALYSIS: 1800,
} as const;

/**
 * API rate limit ayarları.
 */
export const RATE_LIMITS = {
  API: { requests: 100, window: "60 s" },
  AI: { requests: 10, window: "60 s" },
  WEBHOOK: { requests: 50, window: "60 s" },
} as const;
