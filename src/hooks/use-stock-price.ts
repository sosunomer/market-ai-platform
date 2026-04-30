"use client";

import { useEffect, useState, useCallback } from "react";
import { finnhubWS } from "@/lib/ws/finnhub";
import type { WSTradeMessage } from "@/types";

interface StockPriceState {
  price: number | null;
  change: number | null;
  volume: number | null;
  isConnected: boolean;
}

/**
 * Gerçek zamanlı hisse fiyatı hook'u.
 * Finnhub WebSocket üzerinden canlı fiyat akışı sağlar.
 */
export function useStockPrice(symbol: string): StockPriceState {
  const [state, setState] = useState<StockPriceState>({
    price: null,
    change: null,
    volume: null,
    isConnected: false,
  });

  const handleTrade = useCallback((data: WSTradeMessage["data"]) => {
    if (data.length > 0) {
      const latest = data[data.length - 1];
      setState((prev) => ({
        ...prev,
        price: latest.price,
        volume: latest.volume,
        change: prev.price ? latest.price - prev.price : null,
        isConnected: true,
      }));
    }
  }, []);

  useEffect(() => {
    if (!symbol) return;

    finnhubWS.connect();
    finnhubWS.subscribe(symbol, handleTrade);
    setState((prev) => ({ ...prev, isConnected: true }));

    return () => {
      finnhubWS.unsubscribe(symbol, handleTrade);
    };
  }, [symbol, handleTrade]);

  return state;
}
