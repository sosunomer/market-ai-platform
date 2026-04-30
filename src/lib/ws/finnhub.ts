"use client";

import type { WSTradeMessage } from "@/types";

type TradeHandler = (data: WSTradeMessage["data"]) => void;
type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";
type StatusHandler = (status: ConnectionStatus) => void;

/**
 * Finnhub WebSocket bağlantı yöneticisi.
 * Singleton pattern ile tek bir WebSocket bağlantısı üzerinden
 * birden fazla sembol abone olabilir.
 *
 * Özellikler:
 * - Otomatik yeniden bağlanma (exponential backoff)
 * - Birden fazla sembol subscribe/unsubscribe
 * - Bağlantı durumu takibi
 * - Hata yönetimi ve loglama
 * - BIST hisseleri desteği (THYAO.IS formatı)
 */
class FinnhubWebSocket {
  private ws: WebSocket | null = null;
  private subscribers = new Map<string, Set<TradeHandler>>();
  private statusListeners = new Set<StatusHandler>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private _status: ConnectionStatus = "disconnected";
  private pendingSubscriptions = new Set<string>();

  get status(): ConnectionStatus {
    return this._status;
  }

  private setStatus(status: ConnectionStatus) {
    this._status = status;
    this.statusListeners.forEach((listener) => listener(status));
  }

  onStatusChange(handler: StatusHandler): () => void {
    this.statusListeners.add(handler);
    return () => {
      this.statusListeners.delete(handler);
    };
  }

  connect() {
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!apiKey) {
      console.warn("[FinnhubWS] NEXT_PUBLIC_FINNHUB_API_KEY tanımlanmamış.");
      this.setStatus("error");
      return;
    }

    if (
      this.ws?.readyState === WebSocket.OPEN ||
      this.ws?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    this.setStatus("connecting");

    try {
      this.ws = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`);
    } catch {
      this.setStatus("error");
      this.attemptReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.setStatus("connected");

      // Mevcut abonelikleri yeniden gönder
      this.subscribers.forEach((_, symbol) => {
        this.sendSubscribe(symbol);
      });

      // Bekleyen abonelikleri gönder
      this.pendingSubscriptions.forEach((symbol) => {
        this.sendSubscribe(symbol);
      });
      this.pendingSubscriptions.clear();

      this.startPing();
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data as string);

        if (message.type === "trade" && message.data) {
          const tradeMessage = message as WSTradeMessage;
          // Sembollere göre trade'leri grupla
          const tradesBySymbol = new Map<
            string,
            WSTradeMessage["data"]
          >();

          tradeMessage.data.forEach((trade) => {
            const existing = tradesBySymbol.get(trade.symbol) ?? [];
            existing.push(trade);
            tradesBySymbol.set(trade.symbol, existing);
          });

          tradesBySymbol.forEach((trades, symbol) => {
            const handlers = this.subscribers.get(symbol);
            handlers?.forEach((handler) => handler(trades));
          });
        }

        if (message.type === "ping") {
          // Finnhub ping mesajı — bağlantı canlı
        }

        if (message.type === "error") {
          console.error("[FinnhubWS] API hatası:", message.msg);
        }
      } catch {
        console.error("[FinnhubWS] Mesaj parse hatası");
      }
    };

    this.ws.onclose = (event) => {
      this.stopPing();
      if (event.code !== 1000) {
        // Normal kapanma değilse yeniden bağlan
        this.setStatus("disconnected");
        this.attemptReconnect();
      } else {
        this.setStatus("disconnected");
      }
    };

    this.ws.onerror = () => {
      this.setStatus("error");
      this.ws?.close();
    };
  }

  private startPing() {
    this.stopPing();
    // Her 30 saniyede bir ping gönder — bağlantıyı canlı tut
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);
  }

  private stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setStatus("error");
      console.error(
        `[FinnhubWS] Maksimum yeniden bağlanma denemesi (${this.maxReconnectAttempts}) aşıldı.`
      );
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempts),
      30000
    );

    console.info(
      `[FinnhubWS] ${delay}ms sonra yeniden bağlanılacak (deneme ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Bir sembole abone ol.
   * BIST hisseleri için Finnhub formatı: THYAO.IS
   */
  subscribe(symbol: string, handler: TradeHandler) {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());

      if (this.ws?.readyState === WebSocket.OPEN) {
        this.sendSubscribe(symbol);
      } else {
        this.pendingSubscriptions.add(symbol);
        this.connect();
      }
    }
    this.subscribers.get(symbol)!.add(handler);
  }

  /**
   * Bir sembolden aboneliği kaldır.
   */
  unsubscribe(symbol: string, handler: TradeHandler) {
    const handlers = this.subscribers.get(symbol);
    if (!handlers) return;

    handlers.delete(handler);
    if (handlers.size === 0) {
      this.subscribers.delete(symbol);
      this.pendingSubscriptions.delete(symbol);
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "unsubscribe", symbol }));
      }
    }
  }

  private sendSubscribe(symbol: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "subscribe", symbol }));
    }
  }

  /**
   * Abone olunan tüm sembolleri döndür.
   */
  getSubscribedSymbols(): string[] {
    return Array.from(this.subscribers.keys());
  }

  /**
   * Yeniden bağlanma sayacını sıfırla ve tekrar dene.
   */
  resetAndReconnect() {
    this.reconnectAttempts = 0;
    this.disconnect();
    this.connect();
  }

  disconnect() {
    this.stopPing();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.pendingSubscriptions.clear();
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close(1000);
      this.ws = null;
    }
    this.setStatus("disconnected");
  }
}

// Singleton instance
let instance: FinnhubWebSocket | null = null;

export function getFinnhubWS(): FinnhubWebSocket {
  if (!instance) {
    instance = new FinnhubWebSocket();
  }
  return instance;
}

export { type TradeHandler, type ConnectionStatus };
