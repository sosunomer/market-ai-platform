"use client";

import type { WSTradeMessage } from "@/types";

type TradeHandler = (data: WSTradeMessage["data"]) => void;

/**
 * Finnhub WebSocket bağlantı yöneticisi.
 * Singleton pattern ile tek bir WebSocket bağlantısı üzerinden
 * birden fazla sembol abone olabilir.
 */
class FinnhubWebSocket {
  private ws: WebSocket | null = null;
  private subscribers = new Map<string, Set<TradeHandler>>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!apiKey) {
      console.error("Finnhub API key tanımlanmamış.");
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.subscribers.forEach((_, symbol) => {
        this.sendSubscribe(symbol);
      });
    };

    this.ws.onmessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data as string) as WSTradeMessage;
      if (message.type === "trade" && message.data) {
        message.data.forEach((trade) => {
          const handlers = this.subscribers.get(trade.symbol);
          handlers?.forEach((handler) => handler([trade]));
        });
      }
    };

    this.ws.onclose = () => {
      this.attemptReconnect();
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  subscribe(symbol: string, handler: TradeHandler) {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.sendSubscribe(symbol);
      }
    }
    this.subscribers.get(symbol)!.add(handler);
  }

  unsubscribe(symbol: string, handler: TradeHandler) {
    const handlers = this.subscribers.get(symbol);
    if (!handlers) return;

    handlers.delete(handler);
    if (handlers.size === 0) {
      this.subscribers.delete(symbol);
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "unsubscribe", symbol }));
      }
    }
  }

  private sendSubscribe(symbol: string) {
    this.ws?.send(JSON.stringify({ type: "subscribe", symbol }));
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.ws?.close();
    this.ws = null;
    this.subscribers.clear();
  }
}

export const finnhubWS = new FinnhubWebSocket();
