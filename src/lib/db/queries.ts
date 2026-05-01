// =============================================================================
// Market AI Platform — Veritabanı Sorgu Yardımcıları
// =============================================================================
// Supabase projesine bağlandıktan sonra createClient<Database>(...) kullanarak
// tam tip güvenliği sağlayabilirsiniz. Şu an untyped client kullanılıyor ve
// fonksiyon imzaları üzerinden tip güvenliği sağlanıyor.
// =============================================================================

import { createServerClient } from "./supabase";
import type {
  UserRow,
  PortfolioRow,
  PortfolioStockRow,
  WatchlistRow,
  AlertRow,
  AlertStatus,
  NewsItemRow,
  NewsStockImpactRow,
  AIAnalysisRow,
} from "@/types/database";

// -----------------------------------------------------------------------------
// Users
// -----------------------------------------------------------------------------

export async function getUserByClerkId(clerkId: string): Promise<UserRow | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", clerkId)
    .single();

  if (error) return null;
  return data as UserRow;
}

export async function createUser(user: Partial<UserRow> & { clerk_id: string; email: string }): Promise<UserRow> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("users")
    .insert(user)
    .select()
    .single();

  if (error) throw new Error(`Kullanıcı oluşturulamadı: ${error.message}`);
  return data as UserRow;
}

export async function updateUser(id: string, updates: Partial<UserRow>): Promise<UserRow> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Kullanıcı güncellenemedi: ${error.message}`);
  return data as UserRow;
}

// -----------------------------------------------------------------------------
// Portfolios
// -----------------------------------------------------------------------------

export async function getPortfoliosByUserId(userId: string): Promise<PortfolioRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Portföyler getirilemedi: ${error.message}`);
  return (data ?? []) as PortfolioRow[];
}

export async function getPortfolioById(id: string): Promise<PortfolioRow | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as PortfolioRow;
}

export async function createPortfolio(
  portfolio: Partial<PortfolioRow> & { user_id: string; name: string }
): Promise<PortfolioRow> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("portfolios")
    .insert(portfolio)
    .select()
    .single();

  if (error) throw new Error(`Portföy oluşturulamadı: ${error.message}`);
  return data as PortfolioRow;
}

export async function updatePortfolio(id: string, updates: Partial<PortfolioRow>): Promise<PortfolioRow> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("portfolios")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Portföy güncellenemedi: ${error.message}`);
  return data as PortfolioRow;
}

export async function deletePortfolio(id: string): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("portfolios")
    .delete()
    .eq("id", id);

  if (error) throw new Error(`Portföy silinemedi: ${error.message}`);
}

// -----------------------------------------------------------------------------
// Portfolio Stocks
// -----------------------------------------------------------------------------

export async function getPortfolioStocks(portfolioId: string): Promise<PortfolioStockRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("portfolio_stocks")
    .select("*")
    .eq("portfolio_id", portfolioId)
    .order("symbol", { ascending: true });

  if (error) throw new Error(`Portföy hisseleri getirilemedi: ${error.message}`);
  return (data ?? []) as PortfolioStockRow[];
}

export async function addStockToPortfolio(
  stock: Partial<PortfolioStockRow> & { portfolio_id: string; symbol: string; company_name: string }
): Promise<PortfolioStockRow> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("portfolio_stocks")
    .insert(stock)
    .select()
    .single();

  if (error) throw new Error(`Hisse eklenemedi: ${error.message}`);
  return data as PortfolioStockRow;
}

export async function updatePortfolioStock(
  id: string,
  updates: Partial<PortfolioStockRow>
): Promise<PortfolioStockRow> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("portfolio_stocks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Hisse güncellenemedi: ${error.message}`);
  return data as PortfolioStockRow;
}

export async function removeStockFromPortfolio(id: string): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("portfolio_stocks")
    .delete()
    .eq("id", id);

  if (error) throw new Error(`Hisse silinemedi: ${error.message}`);
}

// -----------------------------------------------------------------------------
// Watchlists
// -----------------------------------------------------------------------------

export async function getWatchlist(userId: string): Promise<WatchlistRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("watchlists")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(`Takip listesi getirilemedi: ${error.message}`);
  return (data ?? []) as WatchlistRow[];
}

export async function addToWatchlist(
  item: Partial<WatchlistRow> & { user_id: string; symbol: string; company_name: string }
): Promise<WatchlistRow> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("watchlists")
    .insert(item)
    .select()
    .single();

  if (error) throw new Error(`Takip listesine eklenemedi: ${error.message}`);
  return data as WatchlistRow;
}

export async function removeFromWatchlist(userId: string, symbol: string): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("watchlists")
    .delete()
    .eq("user_id", userId)
    .eq("symbol", symbol);

  if (error) throw new Error(`Takip listesinden çıkarılamadı: ${error.message}`);
}

// -----------------------------------------------------------------------------
// Alerts
// -----------------------------------------------------------------------------

export async function getAlertsByUserId(
  userId: string,
  status?: AlertStatus
): Promise<AlertRow[]> {
  const supabase = createServerClient();
  let query = supabase
    .from("alerts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Uyarılar getirilemedi: ${error.message}`);
  return (data ?? []) as AlertRow[];
}

export async function createAlert(
  alert: Partial<AlertRow> & { user_id: string; symbol: string; company_name: string; target_value: number }
): Promise<AlertRow> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("alerts")
    .insert(alert)
    .select()
    .single();

  if (error) throw new Error(`Uyarı oluşturulamadı: ${error.message}`);
  return data as AlertRow;
}

export async function updateAlert(id: string, updates: Partial<AlertRow>): Promise<AlertRow> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("alerts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Uyarı güncellenemedi: ${error.message}`);
  return data as AlertRow;
}

export async function deleteAlert(id: string): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("alerts")
    .delete()
    .eq("id", id);

  if (error) throw new Error(`Uyarı silinemedi: ${error.message}`);
}

// -----------------------------------------------------------------------------
// News
// -----------------------------------------------------------------------------

export async function getRecentNews(
  limit = 20,
  offset = 0
): Promise<NewsItemRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("news_items")
    .select("*")
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Haberler getirilemedi: ${error.message}`);
  return (data ?? []) as NewsItemRow[];
}

export async function getNewsBySymbol(symbol: string): Promise<NewsItemRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("news_items")
    .select("*")
    .contains("related_symbols", [symbol])
    .order("published_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(`Hisse haberleri getirilemedi: ${error.message}`);
  return (data ?? []) as NewsItemRow[];
}

export async function createNewsItem(
  newsItem: Partial<NewsItemRow> & { title: string; summary: string; url: string }
): Promise<NewsItemRow> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("news_items")
    .insert(newsItem)
    .select()
    .single();

  if (error) throw new Error(`Haber eklenemedi: ${error.message}`);
  return data as NewsItemRow;
}

// -----------------------------------------------------------------------------
// News Stock Impacts
// -----------------------------------------------------------------------------

export async function getImpactsByNewsId(newsItemId: string): Promise<NewsStockImpactRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("news_stock_impacts")
    .select("*")
    .eq("news_item_id", newsItemId)
    .order("impact_score", { ascending: false });

  if (error) throw new Error(`Haber etkileri getirilemedi: ${error.message}`);
  return (data ?? []) as NewsStockImpactRow[];
}

export async function createNewsStockImpact(
  impact: Partial<NewsStockImpactRow> & { news_item_id: string; symbol: string; company_name: string }
): Promise<NewsStockImpactRow> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("news_stock_impacts")
    .insert(impact)
    .select()
    .single();

  if (error) throw new Error(`Haber etkisi eklenemedi: ${error.message}`);
  return data as NewsStockImpactRow;
}

// -----------------------------------------------------------------------------
// AI Analyses
// -----------------------------------------------------------------------------

export async function getAIAnalysesByUserId(
  userId: string,
  limit = 10
): Promise<AIAnalysisRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("ai_analyses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`YZ analizleri getirilemedi: ${error.message}`);
  return (data ?? []) as AIAnalysisRow[];
}

export async function getAIAnalysesBySymbol(
  userId: string,
  symbol: string
): Promise<AIAnalysisRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("ai_analyses")
    .select("*")
    .eq("user_id", userId)
    .eq("symbol", symbol)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(`Hisse YZ analizleri getirilemedi: ${error.message}`);
  return (data ?? []) as AIAnalysisRow[];
}

export async function createAIAnalysis(
  analysis: Partial<AIAnalysisRow> & { user_id: string; symbol: string; summary: string; details: string }
): Promise<AIAnalysisRow> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("ai_analyses")
    .insert(analysis)
    .select()
    .single();

  if (error) throw new Error(`YZ analizi oluşturulamadı: ${error.message}`);
  return data as AIAnalysisRow;
}

export async function deleteAIAnalysis(id: string): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("ai_analyses")
    .delete()
    .eq("id", id);

  if (error) throw new Error(`YZ analizi silinemedi: ${error.message}`);
}
