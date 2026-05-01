import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Haberler",
};

export default function NewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Piyasa Haberleri</h1>
        <p className="text-muted-foreground">
          Güncel piyasa haberleri ve duygu analizi.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Son Haberler</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-muted-foreground">
            Haberler yükleniyor...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
