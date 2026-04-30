# src/hooks/

Özel React hook'ları. Uygulama genelinde tekrar kullanılan durum yönetimi ve yan etki mantığını kapsüller.

## Hook'lar

- `useStockPrice` — WebSocket üzerinden gerçek zamanlı hisse fiyatı takibi
- `usePortfolio` — Portföy verilerini çekme ve güncelleme
- `useAlerts` — Uyarı CRUD işlemleri
- `useDebounce` — Arama girişi debounce'u
- `useLocalStorage` — LocalStorage ile kalıcı durum yönetimi
- `useMediaQuery` — Responsive tasarım için ekran boyutu algılama

## Kurallar

- Her hook `use` ön eki ile başlar.
- Hook'lar `"use client"` direktifi gerektiren dosyalarda tanımlanır.
- Karmaşık mantık hook'lara taşınarak bileşenler sade tutulur.
