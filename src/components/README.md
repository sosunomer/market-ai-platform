# src/components/

Yeniden kullanılabilir React bileşenleri. Alan bazlı (domain-driven) alt klasörlere ayrılmıştır.

## Alt Klasörler

- `ui/` — Temel UI bileşenleri (Button, Card, Input, Modal, Badge, Skeleton vb.). Projenin design system'ini oluşturur.
- `layout/` — Sayfa düzeni bileşenleri (Header, Sidebar, Footer, Navigation). Her sayfada tekrar eden yapısal elementler.
- `charts/` — Recharts tabanlı grafik bileşenleri (PriceChart, VolumeChart, PortfolioPieChart). Finansal veri görselleştirme.
- `portfolio/` — Portföy yönetimi bileşenleri (PortfolioCard, HoldingsList, TradeForm). Kullanıcının varlıklarını yönetme arayüzü.
- `stocks/` — Hisse senedi bileşenleri (StockCard, StockTable, WatchList, Ticker). Piyasa verilerini görüntüleme.
- `ai/` — YZ analiz bileşenleri (ChatInterface, AnalysisCard, SignalBadge). Claude API etkileşim arayüzü.
- `news/` — Haber bileşenleri (NewsCard, NewsFeed, SentimentBadge). Piyasa haberlerini görüntüleme.
- `alerts/` — Uyarı bileşenleri (AlertCard, AlertForm, AlertList). Fiyat uyarılarını yönetme.
- `payment/` — Ödeme bileşenleri (PricingTable, CheckoutForm, SubscriptionCard). Abonelik ve ödeme arayüzü.

## Kurallar

- Her bileşen kendi dosyasında olmalı (örn. `Button.tsx`).
- Bileşenler `"use client"` direktifi ile istemci tarafında çalıştırılır (gerektiğinde).
- Props için TypeScript interface'leri tanımlanır.
- TailwindCSS ile stillendirilir; `cn()` yardımcı fonksiyonu ile class birleştirme yapılır.
