import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StockDetailPageProps {
  params: Promise<{ symbol: string }>;
}

export async function generateMetadata({
  params,
}: StockDetailPageProps): Promise<Metadata> {
  const { symbol } = await params;
  return {
    title: symbol.toUpperCase(),
  };
}

export default async function StockDetailPage({
  params,
}: StockDetailPageProps) {
  const { symbol } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {symbol.toUpperCase()}
        </h1>
        <p className="text-muted-foreground">
          Hisse detayı ve grafik analizi
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fiyat</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">--</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Değişim</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">--</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hacim</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">--</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Piyasa Değeri</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">--</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fiyat Grafiği</CardTitle>
        </CardHeader>
        <CardContent className="h-96">
          <p className="flex h-full items-center justify-center text-muted-foreground">
            Grafik yükleniyor...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
