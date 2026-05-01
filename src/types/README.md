# src/types/

TypeScript tip tanımlamaları. Uygulamanın tüm veri modellerini ve API kontratlarını içerir.

## Dosyalar

- `index.ts` — Ana tip tanımlamaları:
  - `User` — Kullanıcı profili ve abonelik bilgileri
  - `Portfolio`, `PortfolioHolding` — Portföy ve varlık bilgileri
  - `Stock`, `StockQuote`, `StockCandle` — Hisse senedi verileri
  - `Trade` — Alım/satım işlem kayıtları
  - `Alert` — Fiyat/hacim uyarıları
  - `NewsItem` — Piyasa haberleri
  - `PoliticianStatement` — Siyasetçi açıklamaları ve etki analizi
  - `AIAnalysis`, `AIChatMessage` — YZ analiz sonuçları
  - `ApiResponse`, `PaginatedResponse` — API yanıt sarmalayıcıları
  - WebSocket mesaj tipleri
  - UI durum tipleri

## Kurallar

- Tüm tipler `@/types` yolundan import edilir.
- `any` tipi kullanılmaz; somut tipler tanımlanır.
- API yanıtları generic `ApiResponse<T>` ile sarmalanır.
