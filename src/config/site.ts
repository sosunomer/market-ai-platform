export const siteConfig = {
  name: "Market AI Platform",
  description: "Yapay zeka destekli borsa takip ve analiz platformu",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ogImage: "/images/og.png",
  links: {
    github: "https://github.com/sosunomer/market-ai-platform",
  },
  creator: "Market AI Team",
} as const;
