import { SignIn } from "@clerk/nextjs";
import { TrendingUp } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen">
      {/* Sol panel — marka */}
      <div className="hidden flex-1 flex-col justify-between bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 p-12 lg:flex">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Market AI</span>
        </Link>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-white">
            Yapay Zeka ile
            <br />
            <span className="text-blue-400">Akıllı Yatırım</span>
          </h1>
          <p className="max-w-md text-lg text-slate-400">
            Gerçek zamanlı piyasa verileri, AI destekli analizler ve portföy
            yönetimi ile yatırımlarınızı kontrol altına alın.
          </p>
          <div className="flex gap-8 text-sm text-slate-500">
            <div>
              <div className="text-2xl font-bold text-white">50K+</div>
              <div>Aktif Kullanıcı</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">1M+</div>
              <div>Analiz Üretildi</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div>Uptime</div>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-600">
          &copy; {new Date().getFullYear()} Market AI Platform
        </p>
      </div>

      {/* Sağ panel — form */}
      <div className="flex flex-1 items-center justify-center bg-slate-950 p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Market AI</span>
            </Link>
          </div>
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none w-full",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
