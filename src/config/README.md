# src/config/

Uygulama yapılandırma dosyaları. Ortam değişkenlerinin merkezi yönetimi ve plan özellik tanımları.

## Dosyalar

- `site.ts` — Site metadata'sı (başlık, açıklama, URL'ler)
- `plans.ts` — Abonelik planları ve özellik limitleri

## Kurallar

- Tüm ortam değişkenleri burada doğrulanır ve dışa aktarılır.
- Hassas anahtarlar yalnızca sunucu tarafında erişilebilir.
