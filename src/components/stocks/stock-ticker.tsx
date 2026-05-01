"use client";

import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/utils/cn";
import {
  useMultipleStocks,
  type MultiStockItem,
} from "@/hooks/use-multiple-stocks";

// --- TickerItem Bileşeni ---

function TickerItem({ stock }: { stock: MultiStockItem }) {
  const isPositive = stock.change >= 0;
  const isLoading = stock.price === null;

  return (
    <div className="inline-flex items-center gap-3 px-4">
      <span className="text-sm font-bold text-foreground">
        {stock.symbol}
      </span>

      {isLoading ? (
        <span className="text-sm text-muted-foreground">--</span>
      ) : (
        <>
          <span
            className={cn(
              "text-sm font-medium tabular-nums transition-colors duration-300",
              stock.direction === "up" && "text-stock-up",
              stock.direction === "down" && "text-stock-down",
              stock.direction === "neutral" && "text-foreground"
            )}
          >
            {stock.price?.toFixed(2)}
          </span>

          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
              isPositive ? "text-stock-up" : "text-stock-down"
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : stock.change < 0 ? (
              <ArrowDownRight className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            {stock.changePercent >= 0 ? "+" : ""}
            {stock.changePercent.toFixed(2)}%
          </span>
        </>
      )}

      {/* Ayırıcı nokta */}
      <span className="text-muted-foreground/30">•</span>
    </div>
  );
}

// --- StockTicker Bileşeni ---

interface StockTickerProps {
  symbols: string[];
  speed?: "slow" | "normal" | "fast";
  className?: string;
}

const speedMap = {
  slow: "60s",
  normal: "30s",
  fast: "15s",
} as const;

/**
 * Üstte kayan borsa bandı.
 * Gerçek zamanlı fiyat verisi ile sonsuz kaydırma animasyonu.
 *
 * @param symbols - Gösterilecek hisse sembolleri
 * @param speed - Kaydırma hızı ("slow" | "normal" | "fast")
 */
export function StockTicker({
  symbols,
  speed = "normal",
  className,
}: StockTickerProps) {
  const { stocks, connectionStatus } = useMultipleStocks(symbols);

  const stockItems = symbols
    .map((s) => stocks.get(s))
    .filter((item): item is MultiStockItem => item !== undefined);

  const animationDuration = speedMap[speed];

  return (
    <div
      className={cn(
        "relative overflow-hidden border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]",
        className
      )}
    >
      {/* Bağlantı göstergesi */}
      <div className="absolute left-2 top-1/2 z-10 -translate-y-1/2">
        <div
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            connectionStatus === "connected" && "bg-stock-up",
            connectionStatus === "connecting" &&
              "animate-pulse bg-yellow-500",
            connectionStatus === "disconnected" && "bg-muted-foreground",
            connectionStatus === "error" && "bg-stock-down"
          )}
        />
      </div>

      {/* Sol/Sağ gradyan maskeleri */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[hsl(var(--card))] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[hsl(var(--card))] to-transparent" />

      {/* Kayan bant */}
      <div
        className="flex animate-ticker-scroll whitespace-nowrap py-2"
        style={{
          animationDuration,
        }}
      >
        {/* İçerik 2 kez tekrarlanır — sonsuz kaydırma efekti */}
        {stockItems.map((stock) => (
          <TickerItem key={`a-${stock.symbol}`} stock={stock} />
        ))}
        {stockItems.map((stock) => (
          <TickerItem key={`b-${stock.symbol}`} stock={stock} />
        ))}
      </div>
    </div>
  );
}
