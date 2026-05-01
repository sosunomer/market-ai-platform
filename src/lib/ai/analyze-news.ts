import Anthropic from "@anthropic-ai/sdk";

// -----------------------------------------------------------------------------
// Tipler
// -----------------------------------------------------------------------------

export type ImpactDirection = "POZİTİF" | "NEGATİF" | "NÖTR";

export interface NewsAnalysisInput {
  newsText: string;
  politicianName?: string;
  relatedStocks?: string[];
}

export interface ImpactedStock {
  symbol: string;
  expectedImpact: ImpactDirection;
  magnitude: number;
  reasoning: string;
}

export interface NewsAnalysisResult {
  impactedStocks: ImpactedStock[];
  disclaimer: string;
}

// -----------------------------------------------------------------------------
// Sistem Prompt
// -----------------------------------------------------------------------------

const SYSTEM_PROMPT = `Sen deneyimli bir finansal haber analisti ve piyasa uzmanısın. Görevin, politikacı açıklamalarını, ekonomik haberleri ve şirket duyurularını analiz ederek hangi hisselerin nasıl etkileneceğini belirlemek.

KURALLARIN:
1. Her zaman Türkçe yanıt ver.
2. Yanıtını mutlaka aşağıdaki JSON formatında döndür — başka bir şey yazma:
{
  "impactedStocks": [
    {
      "symbol": "THYAO.IS",
      "expectedImpact": "POZİTİF" | "NEGATİF" | "NÖTR",
      "magnitude": 1-10 arası etki büyüklüğü,
      "reasoning": "Türkçe açıklama (1-2 cümle)"
    }
  ]
}

3. Analiz yaparken şunları dikkate al:
   - Haberin/açıklamanın doğrudan etkilediği sektörler
   - Dolaylı etkiler (tedarik zinciri, rakipler, düzenleyici ortam)
   - Tarihsel benzer olayların piyasa etkisi
   - Açıklamayı yapan kişinin konumu ve etkisi
   - BIST hisseleri için .IS uzantısını kullan (örn: THYAO.IS, GARAN.IS)

4. Magnitude (etki büyüklüğü):
   - 1-3: Düşük etki (kısa vadeli, sınırlı fiyat hareketi)
   - 4-6: Orta etki (birkaç gün sürebilecek belirgin hareket)
   - 7-10: Yüksek etki (sektör genelinde önemli değişim)

5. İlgili hisse verilmişse onları mutlaka dahil et, ama ek hisseler de önerebilirsin.
6. En az 1, en fazla 10 hisse döndür.

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

function buildUserPrompt(input: NewsAnalysisInput): string {
  const lines: string[] = ["## Haber/Açıklama Analizi", ""];

  if (input.politicianName) {
    lines.push(`**Açıklama Yapan:** ${input.politicianName}`);
  }

  lines.push("", "### Haber/Açıklama Metni:", `"${input.newsText}"`, "");

  if (input.relatedStocks && input.relatedStocks.length > 0) {
    lines.push(`**İlişkili Hisseler:** ${input.relatedStocks.join(", ")}`, "");
  }

  lines.push(
    "Bu haber/açıklamayı analiz et ve etkilenecek hisseleri JSON formatında döndür."
  );

  return lines.join("\n");
}

const DISCLAIMER =
  "Bu bir yatırım tavsiyesi değildir. Haber analizleri yapay zeka tarafından üretilmiştir ve hata içerebilir. Yatırım kararlarınızı vermeden önce kendi araştırmanızı yapınız.";

export async function analyzeNewsWithAI(
  input: NewsAnalysisInput
): Promise<NewsAnalysisResult> {
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

  // JSON bloğunu çıkar
  let jsonStr = raw;
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  }

  let parsed: { impactedStocks: ImpactedStock[] };

  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error("Claude API yanıtı geçerli JSON değil.");
  }

  // Doğrulama
  const validImpacts: ImpactDirection[] = ["POZİTİF", "NEGATİF", "NÖTR"];

  const validatedStocks: ImpactedStock[] = (parsed.impactedStocks || [])
    .slice(0, 10)
    .map((stock) => ({
      symbol: String(stock.symbol || ""),
      expectedImpact: validImpacts.includes(stock.expectedImpact)
        ? stock.expectedImpact
        : "NÖTR",
      magnitude: Math.min(10, Math.max(1, Math.round(Number(stock.magnitude) || 5))),
      reasoning: String(stock.reasoning || "Analiz gerekçesi oluşturulamadı."),
    }))
    .filter((stock) => stock.symbol.length > 0);

  return {
    impactedStocks: validatedStocks,
    disclaimer: DISCLAIMER,
  };
}
