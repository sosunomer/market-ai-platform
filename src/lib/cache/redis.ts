import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

/**
 * Upstash Redis istemcisi.
 * Sık sorgulanan verilerin önbelleğe alınması için kullanılır.
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL ?? "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
});

/**
 * API rate limiter.
 * Sliding window algoritması ile istek sınırlandırma.
 */
export const apiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "60 s"),
  analytics: true,
  prefix: "ratelimit:api",
});

/**
 * AI endpoint rate limiter.
 * AI sorguları için daha sıkı limit.
 */
export const aiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
  prefix: "ratelimit:ai",
});

/**
 * Cache helper: Değer varsa cache'den döner, yoksa fetcher çalıştırır ve cache'e yazar.
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached !== null) return cached;

  const data = await fetcher();
  await redis.set(key, JSON.stringify(data), { ex: ttlSeconds });
  return data;
}
