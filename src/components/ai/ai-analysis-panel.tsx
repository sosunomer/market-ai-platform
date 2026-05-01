"use client";

import { useState } from "react";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Target,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  Sparkles,
  Info,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  Recommendation,
  RiskLevel,
  StockAnalysisInput,
  StockAnalysisResult,
} from "@/lib/ai/analyze-stock";

// -----------------------------------------------------------------------------
// Alt Bileşenler
// -----------------------------------------------------------------------------

function RecommendationBadge({
  recommendation,
}: {
  recommendation: Recommendation;
}) {
  const config: Record<
    Recommendation,
    { label: string; icon: typeof TrendingUp; className: string }
  > = {
    AL: {
      label: "AL",
      icon: TrendingUp,
      className:
        "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 ring-emerald-500/20",
    },
    SAT: {
      label: "SAT",
      icon: TrendingDown,
      className:
        "bg-red-500/10 text-red-400 border-red-500/30 ring-red-500/20",
    },
    BEKLE: {
      label: "BEKLE",
      icon: Minus,
      className:
        "bg-amber-500/10 text-amber-400 border-amber-500/30 ring-amber-500/20",
    },
  };

  const { label, icon: Icon, className } = config[recommendation];

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border-2 px-8 py-4 ring-4",
        className
      )}
    >
      <Icon className="h-10 w-10" />
      <span className="text-3xl font-black tracking-wide">{label}</span>
    </div>
  );
}

function ConfidenceMeter({ confidence }: { confidence: number }) {
  const color =
    confidence >= 70
      ? "bg-emerald-500"
      : confidence >= 40
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Güven Seviyesi</span>
        <span className="font-semibold tabular-nums">{confidence}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-700", color)}
          style={{ width: `${confidence}%` }}
        />
      </div>
    </div>
  );
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const config: Record<
    RiskLevel,
    { icon: typeof Shield; label: string; className: string }
  > = {
    DÜŞÜK: {
      icon: ShieldCheck,
      label: "Düşük Risk",
      className: "text-emerald-400",
    },
    ORTA: {
      icon: Shield,
      label: "Orta Risk",
      className: "text-amber-400",
    },
    YÜKSEK: {
      icon: ShieldAlert,
      label: "Yüksek Risk",
      className: "text-red-400",
    },
  };

  const { icon: Icon, label, className } = config[level];

  return (
    <div className={cn("flex items-center gap-1.5 text-sm font-medium", className)}>
      <Icon className="h-4 w-4" />
      {label}
    </div>
  );
}

function AnalysisSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Skeleton className="h-24 w-36 rounded-xl" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-10/12" />
        <Skeleton className="h-4 w-9/12" />
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Sonuç Görünümü
// -----------------------------------------------------------------------------

function AnalysisResultView({ result }: { result: StockAnalysisResult }) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Ana Tavsiye */}
      <div className="flex justify-center">
        <RecommendationBadge recommendation={result.recommendation} />
      </div>

      {/* Güven Seviyesi */}
      <ConfidenceMeter confidence={result.confidence} />

      {/* Hedef Fiyat & Risk */}
      <div className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--accent))]/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-blue-400" />
          <span className="text-sm text-muted-foreground">Hedef Fiyat</span>
          <span className="font-bold tabular-nums">
            {result.targetPrice.toLocaleString("tr-TR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <RiskBadge level={result.riskLevel} />
      </div>

      {/* YZ Gerekçesi */}
      <div className="space-y-2">
        <h4 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-blue-400" />
          YZ Analiz Gerekçesi
        </h4>
        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--accent))]/20 p-4">
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {result.reasoning}
          </p>
        </div>
      </div>

      {/* Uyarı */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <p className="text-xs leading-relaxed text-amber-400/80">
          {result.disclaimer}
        </p>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Ana Panel
// -----------------------------------------------------------------------------

interface AIAnalysisPanelProps {
  symbol: string;
  currentPrice: number;
  companyName?: string;
  userAvgCost?: number;
  newsItems?: string[];
  technicalData?: StockAnalysisInput["technicalData"];
  className?: string;
}

export function AIAnalysisPanel({
  symbol,
  currentPrice,
  companyName,
  userAvgCost,
  newsItems,
  technicalData,
  className,
}: AIAnalysisPanelProps) {
  const [result, setResult] = useState<StockAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/ai/analyze-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          currentPrice,
          userAvgCost,
          newsItems,
          technicalData,
        }),
      });

      const data = (await response.json()) as {
        success: boolean;
        data?: StockAnalysisResult;
        error?: string;
      };

      if (!data.success || !data.data) {
        throw new Error(data.error ?? "Analiz oluşturulamadı.");
      }

      setResult(data.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className={cn("border-[hsl(var(--border))]", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-blue-400" />
            YZ Analizi
            {companyName && (
              <span className="text-sm font-normal text-muted-foreground">
                — {companyName}
              </span>
            )}
          </CardTitle>
          <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400">
            {symbol}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Analiz Butonu */}
        {!result && !loading && (
          <div className="flex flex-col items-center gap-3 py-4">
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <p className="text-center text-sm text-muted-foreground">
              Claude YZ ile{" "}
              <span className="font-medium text-foreground">{symbol}</span>{" "}
              hissesini analiz et
            </p>
            <Button
              onClick={handleAnalyze}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Sparkles className="h-4 w-4" />
              Analiz Et
            </Button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              YZ analiz ediyor...
            </div>
            <AnalysisSkeleton />
          </div>
        )}

        {/* Sonuç */}
        {result && !loading && (
          <>
            <AnalysisResultView result={result} />
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAnalyze}
                className="w-full gap-2"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Yeniden Analiz Et
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// --- Dışa aktarım: Mock data ile test için view bileşeni ---

interface AIAnalysisPanelViewProps {
  result: StockAnalysisResult;
  symbol: string;
  companyName?: string;
  className?: string;
}

export function AIAnalysisPanelView({
  result,
  symbol,
  companyName,
  className,
}: AIAnalysisPanelViewProps) {
  return (
    <Card className={cn("border-[hsl(var(--border))]", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-blue-400" />
            YZ Analizi
            {companyName && (
              <span className="text-sm font-normal text-muted-foreground">
                — {companyName}
              </span>
            )}
          </CardTitle>
          <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400">
            {symbol}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <AnalysisResultView result={result} />
      </CardContent>
    </Card>
  );
}
