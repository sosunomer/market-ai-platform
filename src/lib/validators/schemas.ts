import { z } from "zod";

/**
 * Yeni uyarı oluşturma şeması.
 */
export const createAlertSchema = z.object({
  symbol: z.string().min(1, "Sembol gereklidir.").max(10),
  type: z.enum(["price", "percentage", "volume", "news", "ai-signal"]),
  condition: z.enum(["above", "below", "crosses"]),
  targetValue: z.number().positive("Hedef değer pozitif olmalıdır."),
  channels: z
    .array(z.enum(["email", "push", "sms", "in-app"]))
    .min(1, "En az bir bildirim kanalı seçilmelidir."),
  message: z.string().max(500).optional(),
  expiresAt: z.string().datetime().optional(),
});

/**
 * İşlem (trade) oluşturma şeması.
 */
export const createTradeSchema = z.object({
  portfolioId: z.string().uuid(),
  symbol: z.string().min(1).max(10),
  type: z.enum(["buy", "sell"]),
  orderType: z.enum(["market", "limit", "stop-loss", "take-profit"]),
  quantity: z.number().positive("Miktar pozitif olmalıdır."),
  price: z.number().positive("Fiyat pozitif olmalıdır."),
  notes: z.string().max(1000).optional(),
});

/**
 * Portföy oluşturma şeması.
 */
export const createPortfolioSchema = z.object({
  name: z.string().min(1, "Portföy adı gereklidir.").max(100),
  description: z.string().max(500).optional(),
  currency: z.enum(["TRY", "USD", "EUR"]).default("TRY"),
});

/**
 * YZ sohbet mesajı şeması.
 */
export const aiChatSchema = z.object({
  message: z
    .string()
    .min(1, "Mesaj boş olamaz.")
    .max(2000, "Mesaj en fazla 2000 karakter olabilir."),
  symbols: z.array(z.string()).optional(),
});

/**
 * Sayfalama parametreleri şeması.
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
