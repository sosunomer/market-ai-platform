import Anthropic from "@anthropic-ai/sdk";

// -----------------------------------------------------------------------------
// Tipler
// -----------------------------------------------------------------------------

export type Recommendation = "AL" | "SAT" | "BEKLE";
export type RiskLevel = "DÜŞÜK" | "ORTA" | "YÜKSEK";

export interface StockAnalysisInput {
  symbol: string;
  currentPrice: number;
  userAvgCost?: number;
  newsItems?: string[];
  technicalData?: {
    rsi?: number;
    macd?: number;
    sma50?: number;
    sma200?: number;
    volume?: number;
    avgVolume?: number;
    high52w?: number;
    low52w?: number;
    beta?: number;
    pe?: number;
    eps?: number;
    marketCap?: number;
  };
}

export interface StockAnalysisResult {
  recommendation: Recommendation;
  confidence: number;
  reasoning: string;
  targetPrice: number;
  riskLevel: RiskLevel;
  disclaimer: string;
}

// -----------------------------------------------------------------------------
// Sistem Prompt
// -----------------------------------------------------------------------------

const SYSTEM_PROMPT = `Sen deneyimli bir finansal analist ve portföy yöneticisisin. Görevin, verilen hisse senedi verilerini analiz ederek yatırımcılara yön göstermek.

KURALLARIN:
1. Her zaman Türkçe yanıt ver.
2. Yanıtını mutlaka aşağıdaki JSON formatında döndür — başka bir şey yazma:
{
  "recommendation": "AL" | "SAT" | "BEKLE",
  "confidence": 0-100 arası bir sayı,
  "reasoning": "Türkçe analiz gerekçesi (2-4 paragraf)",
  "targetPrice": hedef fiyat (sayı),
  "riskLevel": "DÜŞÜK" | "ORTA" | "YÜKSEK"
}

3. Analiz yaparken şunları dikkate al:
   - Teknik göstergeler (RSI, MACD, hareketli ortalamalar)
   - Temel veriler (F/K, EPS, piyasa değeri)
   - Haber akışı ve piyasa duyarlılığı
   - 52 haftalık yüksek/düşük seviyeleri
   - Hacim analizi
   - Kullanıcının ortalama maliyeti (varsa)

4. Güven seviyesi (confidence) gerçekçi olsun. Veri azsa düşük tut.
5. Hedef fiyat, mevcut fiyattan makul bir sapma göstersin.
6. Risk seviyesini piyasa koşulları ve hisse volatilitesine göre belirle.

ÖNEMLİ: Yalnızca geçerli JSON döndür. Açıklama, markdown veya ek metin ekleme.`;

// -----------------------------------------------------------------------------
// Analiz Fonksiyonu
// -----------------------------------------------------------------------------

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY tanımlanmalıdır.");
  }
  return new Anthropic({ apiKey });
}

function buildUserPrompt(input: StockAnalysisInput): string {
  const lines: string[] = [
    `## ${input.symbol} Hisse Analizi`,
    "",
    `**Güncel Fiyat:** ${input.currentPrice}`,
  ];

  if (input.userAvgCost !== undefined) {
    const pnl = input.currentPrice - input.userAvgCost;
    const pnlPct = ((pnl / input.userAvgCost) * 100).toFixed(2);
    lines.push(`**Kullanıcının Ortalama Maliyeti:** ${input.userAvgCost}`);
    lines.push(`**Kâr/Zarar:** ${pnl > 0 ? "+" : ""}${pnl.toFixed(2)} (${pnlPct}%)`);
  }

  if (input.technicalData) {
    const td = input.technicalData;
    lines.push("", "### Teknik Veriler");
    if (td.rsi !== undefined) lines.push(`- RSI: ${td.rsi}`);
    if (td.macd !== undefined) lines.push(`- MACD: ${td.macd}`);
    if (td.sma50 !== undefined) lines.push(`- 50 Günlük SMA: ${td.sma50}`);
    if (td.sma200 !== undefined) lines.push(`- 200 Günlük SMA: ${td.sma200}`);
    if (td.volume !== undefined) lines.push(`- Hacim: ${td.volume}`);
    if (td.avgVolume !== undefined) lines.push(`- Ortalama Hacim: ${td.avgVolume}`);
    if (td.high52w !== undefined) lines.push(`- 52 Hafta Yüksek: ${td.high52w}`);
    if (td.low52w !== undefined) lines.push(`- 52 Hafta Düşük: ${td.low52w}`);
    if (td.beta !== undefined) lines.push(`- Beta: ${td.beta}`);
    if (td.pe !== undefined) lines.push(`- F/K Oranı: ${td.pe}`);
    if (td.eps !== undefined) lines.push(`- EPS: ${td.eps}`);
    if (td.marketCap !== undefined) lines.push(`- Piyasa Değeri: ${td.marketCap}`);
  }

  if (input.newsItems && input.newsItems.length > 0) {
    lines.push("", "### Son Haberler");
    input.newsItems.forEach((news, i) => {
      lines.push(`${i + 1}. ${news}`);
    });
  }

  lines.push("", "Lütfen bu verileri analiz et ve JSON formatında yanıt ver.");
  return lines.join("\n");
}

const DISCLAIMER = "Bu bir yatırım tavsiyesi değildir. Yatırım kararlarınızı vermeden önce mutlaka lisanslı bir yatırım danışmanına başvurunuz. Yapay zeka analizleri bilgilendirme amaçlıdır ve kayıp riski taşır.";

export async function analyzeStockWithAI(
  input: StockAnalysisInput
): Promise<StockAnalysisResult> {
  const client = getClient();

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildUserPrompt(input),
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude API'den metin yanıtı alınamadı.");
  }

  const raw = textBlock.text.trim();

  // JSON bloğunu çıkar (```json ... ``` sarmalı olabilir)
  let jsonStr = raw;
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  }

  let parsed: {
    recommendation: Recommendation;
    confidence: number;
    reasoning: string;
    targetPrice: number;
    riskLevel: RiskLevel;
  };

  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error("Claude API yanıtı geçerli JSON değil.");
  }

  // Doğrulama
  const validRecs: Recommendation[] = ["AL", "SAT", "BEKLE"];
  const validRisks: RiskLevel[] = ["DÜŞÜK", "ORTA", "YÜKSEK"];

  if (!validRecs.includes(parsed.recommendation)) {
    parsed.recommendation = "BEKLE";
  }
  if (!validRisks.includes(parsed.riskLevel)) {
    parsed.riskLevel = "ORTA";
  }
  if (typeof parsed.confidence !== "number" || parsed.confidence < 0 || parsed.confidence > 100) {
    parsed.confidence = 50;
  }
  if (typeof parsed.targetPrice !== "number" || parsed.targetPrice <= 0) {
    parsed.targetPrice = input.currentPrice;
  }
  if (typeof parsed.reasoning !== "string" || parsed.reasoning.length === 0) {
    parsed.reasoning = "Analiz gerekçesi oluşturulamadı.";
  }

  return {
    recommendation: parsed.recommendation,
    confidence: Math.round(parsed.confidence),
    reasoning: parsed.reasoning,
    targetPrice: Number(parsed.targetPrice.toFixed(2)),
    riskLevel: parsed.riskLevel,
    disclaimer: DISCLAIMER,
  };
}
