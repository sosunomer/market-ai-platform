"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { TrendingUp, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="hidden sm:inline-block">Market AI</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link href="/portfolio">
              <Button variant="ghost" size="sm">
                Portföy
              </Button>
            </Link>
            <Link href="/stocks">
              <Button variant="ghost" size="sm">
                Hisseler
              </Button>
            </Link>
            <Link href="/news">
              <Button variant="ghost" size="sm">
                Haberler
              </Button>
            </Link>
            <Link href="/ai-analysis">
              <Button variant="ghost" size="sm">
                YZ Analiz
              </Button>
            </Link>
            <Link href="/politicians">
              <Button variant="ghost" size="sm">
                Siyasetçiler
              </Button>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden w-64 lg:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Hisse ara... (örn. THYAO)"
              className="pl-8"
            />
          </div>

          <Link href="/alerts">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </Link>

          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}
