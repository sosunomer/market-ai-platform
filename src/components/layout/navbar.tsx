"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Bell, Search, Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const mobileNav = [
  { name: "Dashboard", href: "/" },
  { name: "Portföyüm", href: "/portfolio" },
  { name: "Hisse Takibi", href: "/stocks" },
  { name: "Global Piyasalar", href: "/news" },
  { name: "Açıklamalar", href: "/politicians" },
  { name: "Alarmlar", href: "/alerts" },
  { name: "YZ Analiz", href: "/ai-analysis" },
  { name: "Ayarlar", href: "/settings" },
];

function SubscriptionBadge({ plan }: { plan: string }) {
  const config: Record<string, { label: string; className: string }> = {
    free: {
      label: "Free",
      className: "bg-slate-700 text-slate-300",
    },
    basic: {
      label: "Basic",
      className: "bg-blue-900/50 text-blue-300 border border-blue-700/50",
    },
    pro: {
      label: "Pro",
      className:
        "bg-gradient-to-r from-amber-900/50 to-yellow-900/50 text-amber-300 border border-amber-700/50",
    },
    enterprise: {
      label: "Enterprise",
      className:
        "bg-gradient-to-r from-purple-900/50 to-pink-900/50 text-purple-300 border border-purple-700/50",
    },
  };

  const badge = config[plan] ?? config.free;

  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
        badge.className
      )}
    >
      {badge.label}
    </span>
  );
}

export function Navbar() {
  const { user } = useUser();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const subscriptionPlan =
    (user?.publicMetadata?.subscription as string) ?? "free";

  return (
    <>
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background))]/60 md:px-6">
        {/* Sol: Mobil menü + Arama */}
        <div className="flex items-center gap-3">
          <button
            className="text-muted-foreground lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* Arama */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Hisse ara... (THYAO, AAPL)"
              className="h-9 w-72 border-[hsl(var(--border))] bg-[hsl(var(--input))] pl-9 text-sm placeholder:text-muted-foreground/60"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-[hsl(var(--border))] bg-[hsl(var(--accent))] px-1.5 py-0.5 text-[10px] text-muted-foreground">
              /
            </kbd>
          </div>

          {/* Mobil arama */}
          <button
            className="text-muted-foreground md:hidden"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search className="h-5 w-5" />
          </button>
        </div>

        {/* Sağ: Badge + Bildirimler + Kullanıcı */}
        <div className="flex items-center gap-3">
          <SubscriptionBadge plan={subscriptionPlan} />

          <Link href="/alerts">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-500" />
            </Button>
          </Link>

          <div className="h-6 w-px bg-[hsl(var(--border))]" />

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden text-right text-sm sm:block">
                <p className="font-medium text-foreground">
                  {user.firstName ?? user.username ?? "Kullanıcı"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            )}
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                baseTheme: dark,
                elements: {
                  avatarBox: "h-9 w-9",
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Mobil arama çubuğu */}
      {searchOpen && (
        <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Hisse ara..."
              className="pl-9"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Mobil menü */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-[hsl(var(--background))] lg:hidden">
          <nav className="flex flex-col gap-1 p-4">
            {mobileNav.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-500/10 text-blue-400"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
