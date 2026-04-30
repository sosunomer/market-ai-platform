import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Ayarlar",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ayarlar</h1>
        <p className="text-muted-foreground">
          Hesap ayarlarınızı ve abonelik planınızı yönetin.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>Hesap bilgilerinizi düzenleyin.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="py-4 text-muted-foreground">
              Profil ayarları Clerk üzerinden yönetilir.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Abonelik</CardTitle>
            <CardDescription>
              Mevcut planınız ve ödeme bilgileri.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="py-4 text-muted-foreground">
              Abonelik bilgileri yükleniyor...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
