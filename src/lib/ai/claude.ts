import Anthropic from "@anthropic-ai/sdk";

/**
 * Anthropic Claude API istemcisi.
 */
function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY tanımlanmalıdır.");
  }
  return new Anthropic({ apiKey });
}

/**
 * Hisse senedi analizi yapar.
 */
export async function analyzeStock(
  symbol: string,
  context: {
    price: number;
    change: number;
    volume: number;
    news: string[];
  }
): Promise<string> {
  const client = getClient();

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: `Sen deneyimli bir finansal analistsin. Türkçe yanıt ver. 
Verilen hisse senedi verilerini analiz et ve yatırımcılara öneriler sun.
Teknik ve temel analiz perspektifinden değerlendir.`,
    messages: [
      {
        role: "user",
        content: `${symbol} hissesini analiz et:
- Güncel Fiyat: ${context.price}
- Değişim: ${context.change}%
- Hacim: ${context.volume}
- Son Haberler: ${context.news.join(", ")}

Kısa ve öz bir analiz sun.`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  return textBlock ? textBlock.text : "Analiz oluşturulamadı.";
}

/**
 * Sohbet tabanlı YZ asistanı.
 */
export async function chat(
  messages: Array<{ role: "user" | "assistant"; content: string }>
): Promise<string> {
  const client = getClient();

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: `Sen bir borsa ve finans uzmanı YZ asistanısın. Türkçe yanıt ver.
Kullanıcıların yatırım sorularına, piyasa analizlerine ve portföy stratejilerine yardımcı ol.
Yanıtların net, bilgilendirici ve eyleme dönüştürülebilir olsun.`,
    messages,
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock ? textBlock.text : "Yanıt oluşturulamadı.";
}
