# Market AI Platform

Yapay zeka destekli borsa takip ve analiz platformu. Gerçek zamanlı piyasa verileri, portföy yönetimi, AI destekli analiz ve siyasetçi açıklamaları takibi sunar.

## Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, TailwindCSS |
| Backend | Next.js API Routes, Node.js |
| Veritabanı | PostgreSQL (Supabase) |
| Cache | Redis (Upstash) |
| Auth | Clerk |
| Gerçek Zamanlı | WebSocket (Finnhub API) |
| YZ | Anthropic Claude API |
| Ödeme | Stripe + iyzico |
| Deploy | Vercel |

## Proje Yapısı

```
src/
├── app/                    # Next.js App Router sayfaları ve API route'ları
│   ├── (auth)/             # Kimlik doğrulama sayfaları (sign-in, sign-up)
│   ├── (dashboard)/        # Ana uygulama sayfaları (korumalı)
│   └── api/                # RESTful API endpoint'leri
├── components/             # Yeniden kullanılabilir React bileşenleri
│   ├── ui/                 # Temel UI bileşenleri (Button, Card, Input vb.)
│   ├── layout/             # Düzen bileşenleri (Header, Sidebar, Footer)
│   ├── charts/             # Grafik bileşenleri (Recharts tabanlı)
│   ├── portfolio/          # Portföy yönetimi bileşenleri
│   ├── stocks/             # Hisse senedi bileşenleri
│   ├── ai/                 # YZ analiz bileşenleri
│   ├── news/               # Haber bileşenleri
│   ├── alerts/             # Bildirim/uyarı bileşenleri
│   └── payment/            # Ödeme bileşenleri
├── lib/                    # Kütüphane entegrasyonları ve iş mantığı
│   ├── db/                 # Supabase veritabanı istemcisi ve sorgular
│   ├── cache/              # Upstash Redis cache yönetimi
│   ├── auth/               # Clerk kimlik doğrulama yardımcıları
│   ├── ws/                 # WebSocket bağlantı yönetimi
│   ├── ai/                 # Anthropic Claude API entegrasyonu
│   ├── payment/            # Stripe & iyzico ödeme entegrasyonu
│   └── validators/         # Zod şema doğrulayıcıları
├── hooks/                  # Özel React hook'ları
├── types/                  # TypeScript tip tanımlamaları
├── utils/                  # Yardımcı fonksiyonlar
├── config/                 # Uygulama yapılandırmaları
└── styles/                 # Global CSS stilleri
```

## Kurulum

### Gereksinimler

- Node.js 18+
- npm veya yarn

### Adımlar

1. Repoyu klonlayın:
```bash
git clone https://github.com/sosunomer/market-ai-platform.git
cd market-ai-platform
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Environment değişkenlerini ayarlayın:
```bash
cp .env.example .env.local
# .env.local dosyasını düzenleyin ve gerekli değerleri girin
```

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

5. Tarayıcıda açın: [http://localhost:3000](http://localhost:3000)

## Scriptler

| Script | Açıklama |
|--------|----------|
| `npm run dev` | Geliştirme sunucusunu başlatır |
| `npm run build` | Üretim build'i oluşturur |
| `npm run start` | Üretim sunucusunu başlatır |
| `npm run lint` | ESLint ile kod kontrolü yapar |
| `npm run typecheck` | TypeScript tip kontrolü yapar |
| `npm run format` | Prettier ile kod formatlar |

## Ortam Değişkenleri

Tüm gerekli ortam değişkenleri `.env.example` dosyasında açıklamalı olarak listelenmiştir. Her servis için gerekli API anahtarlarını ilgili servisin dashboard'undan alabilirsiniz.

## Lisans

Bu proje özel bir lisans altındadır. Tüm hakları saklıdır.
