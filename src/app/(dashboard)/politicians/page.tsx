import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Siyasetçi Açıklamaları",
};

export default function PoliticiansPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Siyasetçi Açıklamaları
        </h1>
        <p className="text-muted-foreground">
          Piyasaları etkileyen siyasi açıklamaları takip edin ve AI analizi
          görüntüleyin.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Son Açıklamalar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-muted-foreground">
            Açıklamalar yükleniyor...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
