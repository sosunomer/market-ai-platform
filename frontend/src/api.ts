const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export type Market = {
  id: number;
  code: string;
  name: string;
  country: string;
  timezone: string;
  kind: string;
};

export type Instrument = {
  id: number;
  symbol: string;
  name: string;
  market_id: number;
  sector: string;
  currency: string;
  kind: string;
};

export type Candle = {
  ts: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type PriceSeries = {
  instrument_id: number;
  symbol: string;
  interval: string;
  range: string;
  candles: Candle[];
  source: string;
};

export type Indicators = {
  ma20: (number | null)[];
  ma50: (number | null)[];
  ma200: (number | null)[];
  rsi14: (number | null)[];
  macd: (number | null)[];
  macd_signal: (number | null)[];
  macd_hist: (number | null)[];
};

export type NewsItem = {
  source: string;
  published_at: string;
  title: string;
  url: string;
  summary: string;
};

export type AIReport = {
  summary: string;
  signals: Record<string, unknown>;
  sources: string[];
  mocked: boolean;
};

export type SubscriptionStatus = {
  active: boolean;
  plan: string;
  status: string;
  current_period_end: string | null;
  mocked: boolean;
};

function getToken(): string | null {
  return localStorage.getItem("token");
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const r = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!r.ok) {
    let detail = r.statusText;
    try {
      const body = await r.json();
      detail = body.detail || detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  if (r.status === 204) return undefined as T;
  return (await r.json()) as T;
}

export const api = {
  register: (email: string, password: string) =>
    request<{ access_token: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    request<{ access_token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ id: number; email: string; plan: string }>("/api/auth/me"),

  markets: () => request<Market[]>("/api/markets"),
  instruments: (marketId: number, search?: string) => {
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    return request<Instrument[]>(`/api/markets/${marketId}/instruments${q}`);
  },
  instrument: (id: number) => request<Instrument>(`/api/instruments/${id}`),

  prices: (id: number, range = "1M", interval?: string) => {
    const q = new URLSearchParams({ range });
    if (interval) q.set("interval", interval);
    return request<PriceSeries>(`/api/instruments/${id}/prices?${q}`);
  },
  indicators: (id: number, range = "3M") =>
    request<Indicators>(`/api/instruments/${id}/indicators?range=${range}`),
  news: (id: number, days = 14) =>
    request<NewsItem[]>(`/api/instruments/${id}/news?days=${days}`),

  aiReport: (instrumentId: number, mode: "short" | "long", timeframe = "1M") =>
    request<AIReport>("/api/ai/report", {
      method: "POST",
      body: JSON.stringify({ instrument_id: instrumentId, mode, timeframe }),
    }),
  aiChat: (instrumentId: number | null, question: string) =>
    request<{ answer: string; mocked: boolean }>("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ instrument_id: instrumentId, question }),
    }),

  checkout: () =>
    request<{ url: string; mocked: boolean }>("/api/subscriptions/checkout", {
      method: "POST",
    }),
  subscriptionStatus: () =>
    request<SubscriptionStatus>("/api/subscriptions/status"),
};
