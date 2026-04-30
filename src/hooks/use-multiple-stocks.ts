"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  getFinnhubWS,
  type TradeHandler,
  type ConnectionStatus,
} from "@/lib/ws/finnhub";
import type { WSTradeMessage } from "@/types";

export interface MultiStockItem {
  symbol: string;
  price: number | null;
  previousPrice: number | null;
  change: number;
  changePercent: number;
  volume: number;
  priceHistory: number[];
  lastUpdated: number | null;
  direction: "up" | "down" | "neutral";
}

export interface MultiStockState {
  stocks: Map<string, MultiStockItem>;
  connectionStatus: ConnectionStatus;
}

const MAX_HISTORY_LENGTH = 30;

function createEmptyItem(symbol: string): MultiStockItem {
  return {
    symbol,
    price: null,
    previousPrice: null,
    change: 0,
    changePercent: 0,
    volume: 0,
    priceHistory: [],
    lastUpdated: null,
    direction: "neutral",
  };
}

/**
 * Birden fazla hisse senedini aynı anda gerçek zamanlı takip eden hook.
 * Tek bir WebSocket bağlantısı üzerinden tüm sembolleri dinler.
 *
 * @param symbols - Takip edilecek hisse sembolleri dizisi
 */
export function useMultipleStocks(symbols: string[]): MultiStockState {
  const [stocks, setStocks] = useState<Map<string, MultiStockItem>>(
    () => {
      const map = new Map<string, MultiStockItem>();
      symbols.forEach((s) => map.set(s, createEmptyItem(s)));
      return map;
    }
  );
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");

  const openPricesRef = useRef<Map<string, number>>(new Map());
  const handlersRef = useRef<Map<string, TradeHandler>>(new Map());

  const createHandler = useCallback(
    (symbol: string): TradeHandler =>
      (data: WSTradeMessage["data"]) => {
        if (data.length === 0) return;
        const latest = data[data.length - 1];

        if (!openPricesRef.current.has(symbol)) {
          openPricesRef.current.set(symbol, latest.price);
        }

        setStocks((prev) => {
          const next = new Map(prev);
          const current = next.get(symbol) ?? createEmptyItem(symbol);
          const openPrice =
            openPricesRef.current.get(symbol) ?? latest.price;
          const change = latest.price - openPrice;
          const changePercent =
            openPrice !== 0 ? (change / openPrice) * 100 : 0;

          const direction: "up" | "down" | "neutral" =
            current.price === null
              ? "neutral"
              : latest.price > current.price
                ? "up"
                : latest.price < current.price
                  ? "down"
                  : current.direction;

          const newHistory = [...current.priceHistory, latest.price];
          if (newHistory.length > MAX_HISTORY_LENGTH) {
            newHistory.shift();
          }

          const totalVolume = data.reduce((sum, t) => sum + t.volume, 0);

          next.set(symbol, {
            symbol,
            price: latest.price,
            previousPrice: current.price,
            change,
            changePercent,
            volume: current.volume + totalVolume,
            priceHistory: newHistory,
            lastUpdated: latest.timestamp,
            direction,
          });

          return next;
        });
      },
    []
  );

  useEffect(() => {
    if (symbols.length === 0) return;

    const ws = getFinnhubWS();
    ws.connect();

    const unsubscribeStatus = ws.onStatusChange(setConnectionStatus);
    setConnectionStatus(ws.status);

    // Yeni sembollere abone ol
    symbols.forEach((symbol) => {
      if (!handlersRef.current.has(symbol)) {
        const handler = createHandler(symbol);
        handlersRef.current.set(symbol, handler);
        ws.subscribe(symbol, handler);
      }
    });

    // Artık takip edilmeyen sembollerden aboneliği kaldır
    handlersRef.current.forEach((handler, symbol) => {
      if (!symbols.includes(symbol)) {
        ws.unsubscribe(symbol, handler);
        handlersRef.current.delete(symbol);
      }
    });

    // Yeni sembollere boş kayıt oluştur
    setStocks((prev) => {
      const next = new Map(prev);
      symbols.forEach((s) => {
        if (!next.has(s)) {
          next.set(s, createEmptyItem(s));
        }
      });
      // Kaldırılan sembolleri temizle
      next.forEach((_, s) => {
        if (!symbols.includes(s)) {
          next.delete(s);
        }
      });
      return next;
    });

    const currentHandlers = handlersRef.current;

    return () => {
      currentHandlers.forEach((handler, symbol) => {
        ws.unsubscribe(symbol, handler);
      });
      currentHandlers.clear();
      unsubscribeStatus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbols.join(","), createHandler]);

  return { stocks, connectionStatus };
}

/**
 * useMultipleStocks sonucunu sıralı dizi olarak döndüren yardımcı.
 */
export function useMultipleStocksArray(symbols: string[]) {
  const { stocks, connectionStatus } = useMultipleStocks(symbols);

  const stocksArray = symbols
    .map((s) => stocks.get(s))
    .filter((item): item is MultiStockItem => item !== undefined);

  return { stocks: stocksArray, connectionStatus };
}
