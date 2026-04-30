import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Uyarılar",
};

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Uyarılar</h1>
          <p className="text-muted-foreground">
            Fiyat ve hacim uyarılarınızı yönetin.
          </p>
        </div>
        <Button>Yeni Uyarı</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktif Uyarılar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-muted-foreground">
            Henüz aktif uyarınız bulunmuyor.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
