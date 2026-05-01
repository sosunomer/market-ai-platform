import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "YZ Analiz",
};

export default function AIAnalysisPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">YZ Analiz</h1>
        <p className="text-muted-foreground">
          Claude AI ile hisse senedi analizi ve yatırım önerileri alın.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>YZ Asistan</CardTitle>
            <CardDescription>
              Borsa hakkında sorular sorun, analiz isteyin.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-96">
            <p className="flex h-full items-center justify-center text-muted-foreground">
              Sohbet arayüzü yükleniyor...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Son Analizler</CardTitle>
            <CardDescription>
              AI tarafından oluşturulan son analiz raporları.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="py-8 text-center text-muted-foreground">
              Henüz analiz bulunmuyor.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
