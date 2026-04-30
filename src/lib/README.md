# src/lib/

Kütüphane entegrasyonları, servis katmanları ve iş mantığı. Her alt klasör bir harici servis veya iç modülü temsil eder.

## Alt Klasörler

- `db/` — Supabase PostgreSQL istemcisi. Veritabanı bağlantısı, sorgu yardımcıları ve tablo işlemleri.
- `cache/` — Upstash Redis cache yönetimi. Sık sorgulanan verilerin önbelleğe alınması ve rate limiting.
- `auth/` — Clerk kimlik doğrulama yardımcıları. Oturum kontrolü, yetkilendirme ve kullanıcı yönetimi.
- `ws/` — WebSocket bağlantı yönetimi. Finnhub API üzerinden gerçek zamanlı fiyat akışı.
- `ai/` — Anthropic Claude API entegrasyonu. Hisse analizi, portföy önerileri ve sohbet işlevleri.
- `payment/` — Stripe ve iyzico ödeme entegrasyonları. Abonelik yönetimi, ödeme işlemleri ve webhook doğrulaması.
- `validators/` — Zod şema doğrulayıcıları. API girdi doğrulama, form validasyonu ve tip güvenliği.

## Kurallar

- Bu dizindeki modüller hem sunucu hem istemci tarafında kullanılabilir (uygun olduğunda).
- Her modül singleton pattern ile dışa aktarılır.
- Hassas API anahtarları yalnızca sunucu tarafında kullanılmalıdır.
- Hata yönetimi her servis katmanında yapılmalıdır.
