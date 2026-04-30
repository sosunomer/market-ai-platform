import Link from "next/link";
import { TrendingUp, BarChart3, Brain, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Gerçek Zamanlı Veri",
    description:
      "WebSocket ile anlık borsa verilerini takip edin. BIST, NYSE, NASDAQ destekli.",
    icon: TrendingUp,
  },
  {
    title: "Portföy Yönetimi",
    description:
      "Tüm yatırımlarınızı tek bir panelden yönetin ve performansınızı izleyin.",
    icon: BarChart3,
  },
  {
    title: "YZ Destekli Analiz",
    description:
      "Claude AI ile teknik ve temel analiz, piyasa tahminleri ve kişisel öneriler.",
    icon: Brain,
  },
  {
    title: "Akıllı Uyarılar",
    description:
      "Fiyat, hacim ve haber bazlı uyarılar ile fırsatları kaçırmayın.",
    icon: Shield,
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <section className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-20 text-center">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          Yapay Zeka ile
          <span className="text-primary"> Borsa Takibi</span>
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Gerçek zamanlı piyasa verileri, AI destekli analizler ve akıllı
          portföy yönetimi ile yatırımlarınızı bir üst seviyeye taşıyın.
        </p>
        <div className="flex gap-4">
          <Link href="/sign-up">
            <Button size="lg">Ücretsiz Başla</Button>
          </Link>
          <Link href="/stocks">
            <Button variant="outline" size="lg">
              Piyasaları Gör
            </Button>
          </Link>
        </div>
      </section>

      <section className="border-t bg-card px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-center text-3xl font-bold">Özellikler</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
