"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  getFinnhubWS,
  type TradeHandler,
  type ConnectionStatus,
} from "@/lib/ws/finnhub";
import type { WSTradeMessage } from "@/types";

export interface StockPriceData {
  symbol: string;
  price: number | null;
  previousPrice: number | null;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  priceHistory: number[];
  lastUpdated: number | null;
  direction: "up" | "down" | "neutral";
  connectionStatus: ConnectionStatus;
}

const MAX_HISTORY_LENGTH = 50;

/**
 * Tek bir hisse senedinin gerçek zamanlı fiyatını takip eden hook.
 * Finnhub WebSocket üzerinden canlı fiyat akışı sağlar.
 *
 * @param symbol - Hisse sembolü (örn: "AAPL", "THYAO.IS")
 * @param initialPrice - Başlangıç fiyatı (opsiyonel, API'den ilk veri gelene kadar gösterilir)
 */
export function useStockPrice(
  symbol: string,
  initialPrice?: number
): StockPriceData {
  const [state, setState] = useState<StockPriceData>({
    symbol,
    price: initialPrice ?? null,
    previousPrice: null,
    change: 0,
    changePercent: 0,
    volume: 0,
    high: initialPrice ?? 0,
    low: initialPrice ?? Infinity,
    priceHistory: initialPrice ? [initialPrice] : [],
    lastUpdated: null,
    direction: "neutral",
    connectionStatus: "disconnected",
  });

  const openPriceRef = useRef<number | null>(initialPrice ?? null);

  const handleTrade: TradeHandler = useCallback(
    (data: WSTradeMessage["data"]) => {
      if (data.length === 0) return;

      const latest = data[data.length - 1];

      if (openPriceRef.current === null) {
        openPriceRef.current = latest.price;
      }

      setState((prev) => {
        const openPrice = openPriceRef.current ?? latest.price;
        const change = latest.price - openPrice;
        const changePercent =
          openPrice !== 0 ? (change / openPrice) * 100 : 0;

        const direction: "up" | "down" | "neutral" =
          prev.price === null
            ? "neutral"
            : latest.price > prev.price
              ? "up"
              : latest.price < prev.price
                ? "down"
                : prev.direction;

        const newHistory = [...prev.priceHistory, latest.price];
        if (newHistory.length > MAX_HISTORY_LENGTH) {
          newHistory.shift();
        }

        const totalVolume = data.reduce((sum, t) => sum + t.volume, 0);

        return {
          ...prev,
          price: latest.price,
          previousPrice: prev.price,
          change,
          changePercent,
          volume: prev.volume + totalVolume,
          high: Math.max(prev.high, latest.price),
          low:
            prev.low === Infinity
              ? latest.price
              : Math.min(prev.low, latest.price),
          priceHistory: newHistory,
          lastUpdated: latest.timestamp,
          direction,
        };
      });
    },
    []
  );

  useEffect(() => {
    if (!symbol) return;

    const ws = getFinnhubWS();
    ws.connect();
    ws.subscribe(symbol, handleTrade);

    const unsubscribeStatus = ws.onStatusChange((status) => {
      setState((prev) => ({ ...prev, connectionStatus: status }));
    });

    setState((prev) => ({
      ...prev,
      connectionStatus: ws.status,
      symbol,
    }));

    return () => {
      ws.unsubscribe(symbol, handleTrade);
      unsubscribeStatus();
    };
  }, [symbol, handleTrade]);

  return state;
}
