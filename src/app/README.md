# src/app/

Next.js 14 App Router dizini. Dosya tabanlı yönlendirme sistemi kullanılır.

## Yapı

- `(auth)/` — Clerk ile kimlik doğrulama sayfaları. Parantez içindeki grup, URL'de görünmez.
  - `sign-in/` — Giriş sayfası
  - `sign-up/` — Kayıt sayfası
- `(dashboard)/` — Oturum açmış kullanıcılar için korumalı sayfalar
  - `portfolio/` — Portföy yönetimi
  - `stocks/` — Hisse senedi listesi ve detayları
  - `alerts/` — Fiyat/hacim uyarıları
  - `news/` — Piyasa haberleri
  - `ai-analysis/` — YZ destekli analiz arayüzü
  - `settings/` — Kullanıcı ayarları ve abonelik
  - `politicians/` — Siyasetçi açıklamaları takibi
- `api/` — Sunucu taraflı API endpoint'leri
  - `stocks/` — Hisse senedi verileri
  - `portfolio/` — Portföy CRUD işlemleri
  - `alerts/` — Uyarı yönetimi
  - `ai/` — Claude API ile analiz
  - `payment/` — Stripe & iyzico ödeme işlemleri
  - `webhooks/` — Clerk, Stripe, iyzico webhook handler'ları

## Kurallar

- Her sayfa `page.tsx` dosyası içerir.
- Ortak düzenler `layout.tsx` ile tanımlanır.
- Yükleme durumları `loading.tsx` ile yönetilir.
- Hata durumları `error.tsx` ile yakalanır.
- API route'ları `route.ts` dosyalarında tanımlanır.
