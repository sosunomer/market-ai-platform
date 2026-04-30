"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  Bell,
  Newspaper,
  Brain,
  Landmark,
  Settings,
  CreditCard,
} from "lucide-react";
import { cn } from "@/utils/cn";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Portföy", href: "/portfolio", icon: Briefcase },
  { name: "Hisseler", href: "/stocks", icon: BarChart3 },
  { name: "Uyarılar", href: "/alerts", icon: Bell },
  { name: "Haberler", href: "/news", icon: Newspaper },
  { name: "YZ Analiz", href: "/ai-analysis", icon: Brain },
  { name: "Siyasetçiler", href: "/politicians", icon: Landmark },
  { name: "Abonelik", href: "/settings", icon: CreditCard },
  { name: "Ayarlar", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card lg:block">
      <nav className="flex flex-col gap-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
