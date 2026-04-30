# src/utils/

Genel amaçlı yardımcı fonksiyonlar. Saf (pure) fonksiyonlar olup herhangi bir dış bağımlılığı yoktur.

## Dosyalar

- `formatting.ts` — Sayı, para birimi, tarih ve yüzde formatlama
- `cn.ts` — TailwindCSS class birleştirme yardımcısı (`clsx` + `tailwind-merge`)
- `constants.ts` — Uygulama sabitleri (plan limitleri, API URL'leri, vb.)

## Kurallar

- Fonksiyonlar saf ve test edilebilir olmalıdır.
- Yan etki (side effect) içermemelidir.
- Her fonksiyon dışa aktarılır ve `@/utils` yolundan import edilir.
