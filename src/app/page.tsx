import Link from "next/link";
import {
  TrendingUp,
  BarChart3,
  Brain,
  Shield,
  ArrowRight,
  Globe,
  Zap,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Gerçek Zamanlı Veri",
    description:
      "WebSocket ile anlık borsa verilerini takip edin. BIST, NYSE, NASDAQ destekli.",
    icon: TrendingUp,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Portföy Yönetimi",
    description:
      "Tüm yatırımlarınızı tek bir panelden yönetin ve performansınızı izleyin.",
    icon: BarChart3,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    title: "YZ Destekli Analiz",
    description:
      "Claude AI ile teknik ve temel analiz, piyasa tahminleri ve kişisel öneriler.",
    icon: Brain,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    title: "Akıllı Uyarılar",
    description:
      "Fiyat, hacim ve haber bazlı uyarılar ile fırsatları kaçırmayın.",
    icon: Shield,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
];

const stats = [
  { label: "Aktif Kullanıcı", value: "50K+" },
  { label: "Takip Edilen Hisse", value: "10K+" },
  { label: "YZ Analiz/Gün", value: "100K+" },
  { label: "Uptime", value: "99.9%" },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground">Market AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">
              Giriş Yap
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm">Ücretsiz Başla</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex flex-1 flex-col items-center justify-center gap-8 px-4 py-24 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent" />
        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-400">
            <Zap className="h-3.5 w-3.5" />
            YZ destekli piyasa analizi
          </div>
          <h1 className="max-w-4xl text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-7xl">
            Yapay Zeka ile
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Akıllı Yatırım
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Gerçek zamanlı piyasa verileri, AI destekli analizler ve akıllı
            portföy yönetimi ile yatırımlarınızı bir üst seviyeye taşıyın.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                Hemen Başla
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/stocks">
              <Button variant="outline" size="lg" className="gap-2">
                <Globe className="h-4 w-4" />
                Piyasaları Gör
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* İstatistikler */}
      <section className="border-y border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Özellikler */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-foreground">
              Neden Market AI?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Profesyonel yatırımcılar için tasarlanmış araçlar
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 transition-all hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5"
              >
                <div
                  className={`mb-4 inline-flex rounded-lg p-2.5 ${feature.bg}`}
                >
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Güvenlik */}
      <section className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
          <div className="inline-flex rounded-lg bg-emerald-500/10 p-3">
            <Lock className="h-6 w-6 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Güvenliğiniz Önceliğimiz
          </h2>
          <p className="max-w-xl text-muted-foreground">
            256-bit SSL şifreleme, KVKK uyumlu veri saklama ve iki faktörlü
            doğrulama ile verileriniz güvende.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--border))] px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-500">
              <TrendingUp className="h-3.5 w-3.5 text-white" />
            </div>
            &copy; {new Date().getFullYear()} Market AI Platform
          </div>
          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground">
              Kullanım Koşulları
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Gizlilik
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              İletişim
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
