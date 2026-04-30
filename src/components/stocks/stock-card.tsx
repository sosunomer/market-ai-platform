"use client";

import { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Wifi,
  WifiOff,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useStockPrice, type StockPriceData } from "@/hooks/use-stock-price";

// --- Mini Sparkline Bileşeni ---

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
}

function Sparkline({
  data,
  width = 120,
  height = 40,
  className,
}: SparklineProps) {
  const pathData = useMemo(() => {
    if (data.length < 2) return "";

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y =
        padding + chartHeight - ((value - min) / range) * chartHeight;
      return `${x},${y}`;
    });

    return `M ${points.join(" L ")}`;
  }, [data, width, height]);

  if (data.length < 2) {
    return (
      <div
        className={cn("flex items-center justify-center", className)}
        style={{ width, height }}
      >
        <Minus className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  const isPositive = data[data.length - 1] >= data[0];

  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
    >
      <path
        d={pathData}
        fill="none"
        stroke={isPositive ? "#22c55e" : "#ef4444"}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// --- Fiyat Formatlayıcı ---

function formatPrice(price: number, currency = "USD"): string {
  if (currency === "TRY") {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

function formatChange(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}`;
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

// --- StockCard Bileşeni ---

interface StockCardProps {
  symbol: string;
  companyName: string;
  currency?: "USD" | "TRY" | "EUR";
  averageCost?: number;
  quantity?: number;
  showSparkline?: boolean;
  className?: string;
}

export function StockCard({
  symbol,
  companyName,
  currency = "USD",
  averageCost,
  quantity,
  showSparkline = true,
  className,
}: StockCardProps) {
  const stock = useStockPrice(symbol);

  return (
    <StockCardView
      stock={stock}
      companyName={companyName}
      currency={currency}
      averageCost={averageCost}
      quantity={quantity}
      showSparkline={showSparkline}
      className={className}
    />
  );
}

// --- StockCardView (data ile doğrudan kullanım) ---

interface StockCardViewProps {
  stock: StockPriceData;
  companyName: string;
  currency?: "USD" | "TRY" | "EUR";
  averageCost?: number;
  quantity?: number;
  showSparkline?: boolean;
  className?: string;
}

export function StockCardView({
  stock,
  companyName,
  currency = "USD",
  averageCost,
  quantity,
  showSparkline = true,
  className,
}: StockCardViewProps) {
  const isPositive = stock.change >= 0;
  const isLoading = stock.price === null;

  const profitLoss = useMemo(() => {
    if (
      averageCost === undefined ||
      quantity === undefined ||
      stock.price === null
    ) {
      return null;
    }
    const totalCost = averageCost * quantity;
    const totalValue = stock.price * quantity;
    const pl = totalValue - totalCost;
    const plPercent =
      totalCost !== 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
    return { value: pl, percent: plPercent, totalValue, totalCost };
  }, [averageCost, quantity, stock.price]);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 transition-all duration-200 hover:border-[hsl(var(--primary)_/_0.3)] hover:shadow-lg hover:shadow-primary/5",
        className
      )}
    >
      {/* Üst Kısım: Sembol + Bağlantı Durumu */}
      <div className="mb-3 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">
              {stock.symbol}
            </h3>
            {stock.connectionStatus === "connected" ? (
              <Wifi className="h-3 w-3 text-stock-up" />
            ) : stock.connectionStatus === "connecting" ? (
              <Wifi className="h-3 w-3 animate-pulse text-yellow-500" />
            ) : (
              <WifiOff className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {companyName}
          </p>
        </div>

        {/* Mini Sparkline */}
        {showSparkline && stock.priceHistory.length >= 2 && (
          <Sparkline
            data={stock.priceHistory}
            width={80}
            height={32}
            className="shrink-0"
          />
        )}
      </div>

      {/* Fiyat */}
      <div className="mb-2">
        {isLoading ? (
          <div className="space-y-1">
            <div className="h-7 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <>
            <p
              className={cn(
                "text-2xl font-bold tabular-nums transition-colors duration-300",
                stock.direction === "up" && "text-stock-up",
                stock.direction === "down" && "text-stock-down",
                stock.direction === "neutral" && "text-foreground"
              )}
            >
              {formatPrice(stock.price ?? 0, currency)}
            </p>

            {/* Değişim */}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-sm font-medium tabular-nums",
                  isPositive ? "text-stock-up" : "text-stock-down"
                )}
              >
                {isPositive ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {formatChange(stock.change)}
              </span>
              <span
                className={cn(
                  "rounded px-1 py-0.5 text-xs font-semibold tabular-nums",
                  isPositive
                    ? "bg-stock-up/10 text-stock-up"
                    : "bg-stock-down/10 text-stock-down"
                )}
              >
                {formatPercent(stock.changePercent)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Alım Bilgisi (opsiyonel) */}
      {profitLoss !== null &&
        averageCost !== undefined &&
        quantity !== undefined && (
          <div className="mt-3 border-t border-[hsl(var(--border))] pt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {quantity} adet @ {formatPrice(averageCost, currency)}
              </span>
              <span
                className={cn(
                  "flex items-center gap-1 font-semibold tabular-nums",
                  profitLoss.value >= 0
                    ? "text-stock-up"
                    : "text-stock-down"
                )}
              >
                {profitLoss.value >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {formatPrice(Math.abs(profitLoss.value), currency)} (
                {formatPercent(profitLoss.percent)})
              </span>
            </div>
          </div>
        )}
    </div>
  );
}

export { Sparkline, formatPrice, formatChange, formatPercent };
