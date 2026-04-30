# Supabase — Veritabanı Şeması

Bu klasör Supabase (PostgreSQL) veritabanı şemasını içerir.

## Kurulum

`supabase/migrations/001_initial_schema.sql` dosyasını Supabase SQL Editor'e yapıştırarak tüm tabloları, RLS politikalarını ve index'leri tek seferde oluşturabilirsiniz.

## Tablolar

| Tablo | Açıklama |
|-------|----------|
| `users` | Kullanıcı profili, abonelik tipi, tercihler (Clerk ile senkronize) |
| `portfolios` | Kullanıcının portföyleri (birden fazla olabilir) |
| `portfolio_stocks` | Portföydeki hisseler — sembol, adet, maliyet |
| `watchlists` | Takip listesi (portföyden bağımsız) |
| `alerts` | Fiyat, hacim, haber alarmları |
| `news_items` | Haberler ve politikacı/CEO açıklamaları |
| `news_stock_impacts` | Haber–hisse etki ilişkisi (YZ analizi) |
| `ai_analyses` | YZ tarafından üretilen hisse analizleri |

## View'lar

- `portfolio_summary` — Portföy özet bilgileri
- `active_alerts_summary` — Aktif uyarılar
- `recent_news_with_impacts` — Son haberler ve etkilenen hisseler

## RLS Politikaları

Tüm tablolarda Row Level Security aktiftir:
- Kullanıcıya ait veriler: Sadece kendi verilerini görebilir/düzenleyebilir
- Haberler ve etkiler: Herkes okuyabilir, yazma `service_role` ile yapılır
- Kullanıcı oluşturma: Webhook (service_role) ile yapılır

## TypeScript Tipleri

`src/types/database.ts` dosyasında tüm tablo satır tipleri, insert tipleri, update tipleri ve Supabase `Database` tipi tanımlıdır.
