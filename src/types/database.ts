// =============================================================================
// Market AI Platform — Veritabanı (Supabase) TypeScript Tipleri
// =============================================================================
// Bu dosya doğrudan SQL şemasıyla eşleşen satır tiplerini tanımlar.
// Supabase client ile kullanılır.
// =============================================================================

// -----------------------------------------------------------------------------
// Enum Tipleri (SQL enum'larla birebir eşleşir)
// -----------------------------------------------------------------------------

export type SubscriptionPlan = "free" | "basic" | "pro" | "enterprise";
export type PaymentProvider = "stripe" | "iyzico";
export type CurrencyCode = "TRY" | "USD" | "EUR";
export type ExchangeType = "BIST" | "NYSE" | "NASDAQ" | "CRYPTO";
export type AlertType = "price" | "percentage" | "volume" | "news" | "ai-signal";
export type AlertCondition = "above" | "below" | "crosses";
export type AlertStatus = "active" | "triggered" | "expired" | "disabled";
export type AlertChannel = "email" | "push" | "sms" | "in-app";
export type NewsSentiment = "positive" | "negative" | "neutral";
export type NewsSource = "finnhub" | "bloomberg" | "reuters" | "aa" | "custom";
export type StatementImpact = "positive" | "negative" | "neutral" | "uncertain";
export type AnalysisType = "technical" | "fundamental" | "sentiment" | "prediction";
export type SignalStrength = "strong-buy" | "buy" | "hold" | "sell" | "strong-sell";

// -----------------------------------------------------------------------------
// Kullanıcı Tercihleri (JSONB)
// -----------------------------------------------------------------------------

export interface UserPreferences {
  language: "tr" | "en";
  currency: CurrencyCode;
  theme: "light" | "dark" | "system";
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

// -----------------------------------------------------------------------------
// YZ Analiz Faktörü (JSONB dizisi)
// -----------------------------------------------------------------------------

export interface AIFactorRow {
  name: string;
  impact: "positive" | "negative" | "neutral";
  weight: number;
  description: string;
}

// -----------------------------------------------------------------------------
// Tablo Satır Tipleri (Row Types)
// -----------------------------------------------------------------------------

/** users tablosu */
export interface UserRow {
  id: string;
  clerk_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  subscription: SubscriptionPlan;
  payment_provider: PaymentProvider | null;
  stripe_customer_id: string | null;
  iyzico_customer_id: string | null;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}

/** portfolios tablosu */
export interface PortfolioRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  currency: CurrencyCode;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

/** portfolio_stocks tablosu */
export interface PortfolioStockRow {
  id: string;
  portfolio_id: string;
  symbol: string;
  company_name: string;
  exchange: ExchangeType;
  quantity: number;
  average_cost: number;
  total_invested: number;
  currency: CurrencyCode;
  notes: string | null;
  first_bought_at: string;
  created_at: string;
  updated_at: string;
}

/** watchlists tablosu */
export interface WatchlistRow {
  id: string;
  user_id: string;
  symbol: string;
  company_name: string;
  exchange: ExchangeType;
  sort_order: number;
  added_at: string;
}

/** alerts tablosu */
export interface AlertRow {
  id: string;
  user_id: string;
  symbol: string;
  company_name: string;
  type: AlertType;
  condition: AlertCondition;
  target_value: number;
  current_value: number;
  status: AlertStatus;
  channels: AlertChannel[];
  message: string | null;
  triggered_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

/** news_items tablosu */
export interface NewsItemRow {
  id: string;
  title: string;
  summary: string;
  content: string | null;
  url: string;
  image_url: string | null;
  source: NewsSource;
  author: string | null;
  speaker_name: string | null;
  speaker_title: string | null;
  speaker_party: string | null;
  speaker_country: string | null;
  sentiment: NewsSentiment;
  sentiment_score: number;
  impact: StatementImpact;
  impact_score: number;
  related_symbols: string[];
  affected_sectors: string[];
  ai_analysis: string | null;
  published_at: string;
  fetched_at: string;
  analyzed_at: string | null;
}

/** news_stock_impacts tablosu */
export interface NewsStockImpactRow {
  id: string;
  news_item_id: string;
  symbol: string;
  company_name: string;
  exchange: ExchangeType;
  impact: StatementImpact;
  impact_score: number;
  predicted_change: number | null;
  confidence: number;
  reasoning: string | null;
  analyzed_at: string;
}

/** ai_analyses tablosu */
export interface AIAnalysisRow {
  id: string;
  user_id: string;
  symbol: string;
  type: AnalysisType;
  signal: SignalStrength;
  confidence: number;
  summary: string;
  details: string;
  factors: AIFactorRow[];
  price_target: number | null;
  stop_loss: number | null;
  time_horizon: string;
  model_version: string;
  created_at: string;
}

// -----------------------------------------------------------------------------
// Supabase Database Tipi (type-safe client için)
// -----------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: {
          id?: string;
          clerk_id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          image_url?: string | null;
          subscription?: SubscriptionPlan;
          payment_provider?: PaymentProvider | null;
          stripe_customer_id?: string | null;
          iyzico_customer_id?: string | null;
          preferences?: UserPreferences;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          image_url?: string | null;
          subscription?: SubscriptionPlan;
          payment_provider?: PaymentProvider | null;
          stripe_customer_id?: string | null;
          iyzico_customer_id?: string | null;
          preferences?: UserPreferences;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      portfolios: {
        Row: PortfolioRow;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          currency?: CurrencyCode;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          currency?: CurrencyCode;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "portfolios_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      portfolio_stocks: {
        Row: PortfolioStockRow;
        Insert: {
          id?: string;
          portfolio_id: string;
          symbol: string;
          company_name: string;
          exchange?: ExchangeType;
          quantity?: number;
          average_cost?: number;
          total_invested?: number;
          currency?: CurrencyCode;
          notes?: string | null;
          first_bought_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          portfolio_id?: string;
          symbol?: string;
          company_name?: string;
          exchange?: ExchangeType;
          quantity?: number;
          average_cost?: number;
          total_invested?: number;
          currency?: CurrencyCode;
          notes?: string | null;
          first_bought_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "portfolio_stocks_portfolio_id_fkey";
            columns: ["portfolio_id"];
            isOneToOne: false;
            referencedRelation: "portfolios";
            referencedColumns: ["id"];
          },
        ];
      };
      watchlists: {
        Row: WatchlistRow;
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          company_name: string;
          exchange?: ExchangeType;
          sort_order?: number;
          added_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          symbol?: string;
          company_name?: string;
          exchange?: ExchangeType;
          sort_order?: number;
          added_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "watchlists_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      alerts: {
        Row: AlertRow;
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          company_name: string;
          type?: AlertType;
          condition?: AlertCondition;
          target_value: number;
          current_value?: number;
          status?: AlertStatus;
          channels?: AlertChannel[];
          message?: string | null;
          triggered_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          symbol?: string;
          company_name?: string;
          type?: AlertType;
          condition?: AlertCondition;
          target_value?: number;
          current_value?: number;
          status?: AlertStatus;
          channels?: AlertChannel[];
          message?: string | null;
          triggered_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "alerts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      news_items: {
        Row: NewsItemRow;
        Insert: {
          id?: string;
          title: string;
          summary: string;
          content?: string | null;
          url: string;
          image_url?: string | null;
          source?: NewsSource;
          author?: string | null;
          speaker_name?: string | null;
          speaker_title?: string | null;
          speaker_party?: string | null;
          speaker_country?: string | null;
          sentiment?: NewsSentiment;
          sentiment_score?: number;
          impact?: StatementImpact;
          impact_score?: number;
          related_symbols?: string[];
          affected_sectors?: string[];
          ai_analysis?: string | null;
          published_at?: string;
          fetched_at?: string;
          analyzed_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          summary?: string;
          content?: string | null;
          url?: string;
          image_url?: string | null;
          source?: NewsSource;
          author?: string | null;
          speaker_name?: string | null;
          speaker_title?: string | null;
          speaker_party?: string | null;
          speaker_country?: string | null;
          sentiment?: NewsSentiment;
          sentiment_score?: number;
          impact?: StatementImpact;
          impact_score?: number;
          related_symbols?: string[];
          affected_sectors?: string[];
          ai_analysis?: string | null;
          published_at?: string;
          fetched_at?: string;
          analyzed_at?: string | null;
        };
        Relationships: [];
      };
      news_stock_impacts: {
        Row: NewsStockImpactRow;
        Insert: {
          id?: string;
          news_item_id: string;
          symbol: string;
          company_name: string;
          exchange?: ExchangeType;
          impact?: StatementImpact;
          impact_score?: number;
          predicted_change?: number | null;
          confidence?: number;
          reasoning?: string | null;
          analyzed_at?: string;
        };
        Update: {
          id?: string;
          news_item_id?: string;
          symbol?: string;
          company_name?: string;
          exchange?: ExchangeType;
          impact?: StatementImpact;
          impact_score?: number;
          predicted_change?: number | null;
          confidence?: number;
          reasoning?: string | null;
          analyzed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "news_stock_impacts_news_item_id_fkey";
            columns: ["news_item_id"];
            isOneToOne: false;
            referencedRelation: "news_items";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_analyses: {
        Row: AIAnalysisRow;
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          type?: AnalysisType;
          signal?: SignalStrength;
          confidence?: number;
          summary: string;
          details: string;
          factors?: AIFactorRow[];
          price_target?: number | null;
          stop_loss?: number | null;
          time_horizon?: string;
          model_version?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          symbol?: string;
          type?: AnalysisType;
          signal?: SignalStrength;
          confidence?: number;
          summary?: string;
          details?: string;
          factors?: AIFactorRow[];
          price_target?: number | null;
          stop_loss?: number | null;
          time_horizon?: string;
          model_version?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_analyses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      portfolio_summary: {
        Row: {
          portfolio_id: string;
          user_id: string;
          name: string;
          currency: CurrencyCode;
          is_default: boolean;
          position_count: number;
          total_invested: number;
          total_positions: number;
          created_at: string;
          updated_at: string;
        };
        Relationships: [];
      };
      active_alerts_summary: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          company_name: string;
          type: AlertType;
          condition: AlertCondition;
          target_value: number;
          current_value: number;
          channels: AlertChannel[];
          created_at: string;
        };
        Relationships: [];
      };
      recent_news_with_impacts: {
        Row: {
          id: string;
          title: string;
          summary: string;
          source: NewsSource;
          speaker_name: string | null;
          speaker_title: string | null;
          speaker_party: string | null;
          sentiment: NewsSentiment;
          sentiment_score: number;
          impact: StatementImpact;
          impact_score: number;
          related_symbols: string[];
          published_at: string;
          impacted_stock_count: number;
          impacted_symbols: string[] | null;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      subscription_plan: SubscriptionPlan;
      payment_provider: PaymentProvider;
      currency_code: CurrencyCode;
      exchange_type: ExchangeType;
      alert_type: AlertType;
      alert_condition: AlertCondition;
      alert_status: AlertStatus;
      alert_channel: AlertChannel;
      news_sentiment: NewsSentiment;
      news_source: NewsSource;
      statement_impact: StatementImpact;
      analysis_type: AnalysisType;
      signal_strength: SignalStrength;
    };
  };
}

// -----------------------------------------------------------------------------
// Yardımcı Tipler (queries.ts'de kullanılır)
// -----------------------------------------------------------------------------

export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];
export type PortfolioInsert = Database["public"]["Tables"]["portfolios"]["Insert"];
export type PortfolioUpdate = Database["public"]["Tables"]["portfolios"]["Update"];
export type PortfolioStockInsert = Database["public"]["Tables"]["portfolio_stocks"]["Insert"];
export type PortfolioStockUpdate = Database["public"]["Tables"]["portfolio_stocks"]["Update"];
export type WatchlistInsert = Database["public"]["Tables"]["watchlists"]["Insert"];
export type WatchlistUpdate = Database["public"]["Tables"]["watchlists"]["Update"];
export type AlertInsert = Database["public"]["Tables"]["alerts"]["Insert"];
export type AlertUpdate = Database["public"]["Tables"]["alerts"]["Update"];
export type NewsItemInsert = Database["public"]["Tables"]["news_items"]["Insert"];
export type NewsItemUpdate = Database["public"]["Tables"]["news_items"]["Update"];
export type NewsStockImpactInsert = Database["public"]["Tables"]["news_stock_impacts"]["Insert"];
export type NewsStockImpactUpdate = Database["public"]["Tables"]["news_stock_impacts"]["Update"];
export type AIAnalysisInsert = Database["public"]["Tables"]["ai_analyses"]["Insert"];
export type AIAnalysisUpdate = Database["public"]["Tables"]["ai_analyses"]["Update"];
