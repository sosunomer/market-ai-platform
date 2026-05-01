import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Portföy",
};

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Portföy</h1>
        <p className="text-muted-foreground">
          Yatırımlarınızı yönetin ve performansınızı takip edin.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Toplam Değer</CardDescription>
            <CardTitle className="text-2xl">₺0,00</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Portföy yükleniyor...</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Toplam Kar/Zarar</CardDescription>
            <CardTitle className="text-2xl">₺0,00</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">--</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Günlük Değişim</CardDescription>
            <CardTitle className="text-2xl">%0,00</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">--</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Varlıklarım</CardTitle>
          <CardDescription>Portföyünüzdeki hisse senetleri</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-muted-foreground">
            Henüz portföyünüzde varlık bulunmuyor. Hisse ekleyerek başlayın.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
