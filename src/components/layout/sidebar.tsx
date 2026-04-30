"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  Globe,
  Landmark,
  Bell,
  Brain,
  Settings,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Portföyüm", href: "/portfolio", icon: Briefcase },
  { name: "Hisse Takibi", href: "/stocks", icon: BarChart3 },
  { name: "Global Piyasalar", href: "/news", icon: Globe },
  { name: "Açıklamalar", href: "/politicians", icon: Landmark },
  { name: "Alarmlar", href: "/alerts", icon: Bell },
  { name: "YZ Analiz", href: "/ai-analysis", icon: Brain },
  { name: "Ayarlar", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden flex-col border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] transition-all duration-300 lg:flex",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-[hsl(var(--sidebar-border))] px-4",
          collapsed ? "justify-center" : "gap-3"
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-[hsl(var(--sidebar-foreground))]">
            Market AI
          </span>
        )}
      </div>

      {/* Navigasyon */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navigation.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-blue-500/10 text-blue-400"
                  : "text-[hsl(var(--sidebar-foreground))]/70 hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive ? "text-blue-400" : ""
                )}
              />
              {!collapsed && item.name}
              {isActive && !collapsed && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Daralt/Genişlet */}
      <div className="border-t border-[hsl(var(--sidebar-border))] p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-[hsl(var(--sidebar-foreground))]/50 transition-colors hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Daralt</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
