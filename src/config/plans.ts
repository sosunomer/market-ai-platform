import type { SubscriptionPlan } from "@/types";

export interface PlanConfig {
  id: SubscriptionPlan;
  name: string;
  description: string;
  priceMonthly: {
    TRY: number;
    USD: number;
  };
  popular: boolean;
}

export const plans: PlanConfig[] = [
  {
    id: "free",
    name: "Ücretsiz",
    description: "Temel piyasa takibi için",
    priceMonthly: { TRY: 0, USD: 0 },
    popular: false,
  },
  {
    id: "basic",
    name: "Başlangıç",
    description: "Aktif yatırımcılar için",
    priceMonthly: { TRY: 149, USD: 9.99 },
    popular: false,
  },
  {
    id: "pro",
    name: "Profesyonel",
    description: "Profesyonel analistler için",
    priceMonthly: { TRY: 399, USD: 24.99 },
    popular: true,
  },
  {
    id: "enterprise",
    name: "Kurumsal",
    description: "Kurumsal ekipler için",
    priceMonthly: { TRY: 999, USD: 59.99 },
    popular: false,
  },
];
