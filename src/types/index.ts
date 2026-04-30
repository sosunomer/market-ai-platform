// =============================================================================
// Market AI Platform - TypeScript Type Definitions
// =============================================================================

// Veritabanı satır tiplerini re-export et
export type {
  Database,
  UserRow,
  PortfolioRow,
  PortfolioStockRow,
  WatchlistRow,
  AlertRow,
  NewsItemRow,
  NewsStockImpactRow,
  AIAnalysisRow,
  UserPreferences,
  AIFactorRow,
} from "./database";

// -----------------------------------------------------------------------------
// User & Authentication
// -----------------------------------------------------------------------------

export type SubscriptionPlan = "free" | "basic" | "pro" | "enterprise";

export type PaymentProvider = "stripe" | "iyzico";

export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  subscription: SubscriptionPlan;
  paymentProvider: PaymentProvider | null;
  stripeCustomerId: string | null;
  iyzicoCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// -----------------------------------------------------------------------------
// Portfolio
// -----------------------------------------------------------------------------

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  currency: "TRY" | "USD" | "EUR";
  isDefault: boolean;
  totalValue: number;
  totalCost: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  holdings: PortfolioHolding[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioHolding {
  id: string;
  portfolioId: string;
  symbol: string;
  companyName: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  exchange: Exchange;
}

// -----------------------------------------------------------------------------
// Stock & Market Data
// -----------------------------------------------------------------------------

export type Exchange = "BIST" | "NYSE" | "NASDAQ" | "CRYPTO";

export type MarketStatus = "open" | "closed" | "pre-market" | "after-hours";

export interface Stock {
  symbol: string;
  companyName: string;
  exchange: Exchange;
  currentPrice: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCap: number;
  change: number;
  changePercent: number;
  currency: string;
  lastUpdated: Date;
}

export interface StockQuote {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
}

export interface StockCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type CandleResolution = "1" | "5" | "15" | "30" | "60" | "D" | "W" | "M";

export interface MarketSummary {
  exchange: Exchange;
  status: MarketStatus;
  indexValue: number;
  indexChange: number;
  indexChangePercent: number;
  topGainers: Stock[];
  topLosers: Stock[];
  mostActive: Stock[];
}

// -----------------------------------------------------------------------------
// Trade
// -----------------------------------------------------------------------------

export type TradeType = "buy" | "sell";

export type TradeStatus = "pending" | "executed" | "cancelled" | "failed";

export type OrderType = "market" | "limit" | "stop-loss" | "take-profit";

export interface Trade {
  id: string;
  userId: string;
  portfolioId: string;
  symbol: string;
  companyName: string;
  type: TradeType;
  status: TradeStatus;
  orderType: OrderType;
  quantity: number;
  price: number;
  totalAmount: number;
  commission: number;
  currency: string;
  notes: string | null;
  executedAt: Date | null;
  createdAt: Date;
}

// -----------------------------------------------------------------------------
// Alert
// -----------------------------------------------------------------------------

export type AlertType = "price" | "percentage" | "volume" | "news" | "ai-signal";

export type AlertCondition = "above" | "below" | "crosses";

export type AlertStatus = "active" | "triggered" | "expired" | "disabled";

export type AlertChannel = "email" | "push" | "sms" | "in-app";

export interface Alert {
  id: string;
  userId: string;
  symbol: string;
  companyName: string;
  type: AlertType;
  condition: AlertCondition;
  targetValue: number;
  currentValue: number;
  status: AlertStatus;
  channels: AlertChannel[];
  message: string | null;
  triggeredAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

// -----------------------------------------------------------------------------
// News
// -----------------------------------------------------------------------------

export type NewsSentiment = "positive" | "negative" | "neutral";

export type NewsSource =
  | "finnhub"
  | "bloomberg"
  | "reuters"
  | "aa"
  | "custom";

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string | null;
  url: string;
  imageUrl: string | null;
  source: NewsSource;
  author: string | null;
  sentiment: NewsSentiment;
  sentimentScore: number;
  relatedSymbols: string[];
  publishedAt: Date;
  fetchedAt: Date;
}

// -----------------------------------------------------------------------------
// Politician Statement (Siyasetçi Açıklamaları)
// -----------------------------------------------------------------------------

export type PoliticalParty = string;

export type StatementImpact = "positive" | "negative" | "neutral" | "uncertain";

export interface PoliticianStatement {
  id: string;
  politicianName: string;
  title: string;
  party: PoliticalParty;
  country: string;
  statement: string;
  summary: string;
  context: string | null;
  impact: StatementImpact;
  impactScore: number;
  affectedSectors: string[];
  affectedSymbols: string[];
  aiAnalysis: string | null;
  sourceUrl: string;
  publishedAt: Date;
  analyzedAt: Date;
}

// -----------------------------------------------------------------------------
// AI Analysis
// -----------------------------------------------------------------------------

export type AnalysisType = "technical" | "fundamental" | "sentiment" | "prediction";

export type SignalStrength = "strong-buy" | "buy" | "hold" | "sell" | "strong-sell";

export interface AIAnalysis {
  id: string;
  userId: string;
  symbol: string;
  type: AnalysisType;
  signal: SignalStrength;
  confidence: number;
  summary: string;
  details: string;
  factors: AIFactor[];
  priceTarget: number | null;
  stopLoss: number | null;
  timeHorizon: string;
  createdAt: Date;
}

export interface AIFactor {
  name: string;
  impact: "positive" | "negative" | "neutral";
  weight: number;
  description: string;
}

export interface AIChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: {
    symbols?: string[];
    analysisType?: AnalysisType;
  };
  createdAt: Date;
}

// -----------------------------------------------------------------------------
// Payment & Subscription
// -----------------------------------------------------------------------------

export interface SubscriptionFeatures {
  maxPortfolios: number;
  maxAlerts: number;
  maxWatchlistItems: number;
  aiAnalysisPerDay: number;
  realTimeData: boolean;
  advancedCharts: boolean;
  politicianTracking: boolean;
  exportData: boolean;
  prioritySupport: boolean;
}

export type PlanFeatureMap = Record<SubscriptionPlan, SubscriptionFeatures>;

export interface PaymentTransaction {
  id: string;
  userId: string;
  provider: PaymentProvider;
  externalId: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  plan: SubscriptionPlan;
  createdAt: Date;
}

// -----------------------------------------------------------------------------
// WebSocket
// -----------------------------------------------------------------------------

export type WSMessageType = "subscribe" | "unsubscribe" | "trade" | "ping";

export interface WSTradeMessage {
  type: "trade";
  data: {
    symbol: string;
    price: number;
    volume: number;
    timestamp: number;
    conditions: string[];
  }[];
}

export interface WSSubscribeMessage {
  type: "subscribe";
  symbol: string;
}

export interface WSUnsubscribeMessage {
  type: "unsubscribe";
  symbol: string;
}

// -----------------------------------------------------------------------------
// API Response Wrappers
// -----------------------------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// -----------------------------------------------------------------------------
// UI State
// -----------------------------------------------------------------------------

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DateRange {
  from: Date;
  to: Date;
}
