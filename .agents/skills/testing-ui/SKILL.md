# Market AI Platform — UI Testing

## Devin Secrets Needed

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk publishable key for auth components
- `CLERK_SECRET_KEY` — Clerk secret key for middleware auth
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key

## Local Dev Server

```bash
cd /home/ubuntu/repos/market-ai-platform
npm install
npm run dev  # starts on localhost:3000
```

## Testing Without Clerk Keys

Clerk requires valid API keys to render SignIn/SignUp/UserButton components. Without keys, the app will crash with 500 errors.

**Workaround — Bypass Clerk for UI-only testing:**

1. **Middleware** (`src/middleware.ts`): Replace `clerkMiddleware` with simple `NextResponse.next()`
2. **Root Layout** (`src/app/layout.tsx`): Remove `ClerkProvider` wrapper, keep `<html>` and `<body>` directly
3. **Auth Pages** (`src/app/(auth)/sign-in/page.tsx`, `sign-up/page.tsx`): Replace `<SignIn>` / `<SignUp>` components with placeholder divs
4. **Navbar** (`src/components/layout/navbar.tsx`): Remove `useUser()` hook and `UserButton`, use hardcoded test user data

**Important:** These changes are temporary for testing only. Restore original Clerk components before committing.

## Key Pages to Verify

| Page | URL | Key Elements |
|------|-----|-------------|
| Landing | `/` | Dark theme, gradient hero text, 4 stats, 4 feature cards, header CTAs, footer |
| Portfolio | `/portfolio` | Sidebar (8 nav links), navbar (search, badge, bell, user info), content area |
| Stocks | `/stocks` | BIST 100 / S&P 500 / NASDAQ cards, Hisse Listesi |
| AI Analysis | `/ai-analysis` | YZ Asistan chat area, Son Analizler panel |
| Sign-In | `/sign-in` | Split-panel: left brand (stats), right Clerk/placeholder |
| Sign-Up | `/sign-up` | Split-panel: left brand (feature bullets), right Clerk/placeholder |

## Sidebar Testing

- **Collapse**: Click "Daralt" button at sidebar bottom → sidebar collapses to ~68px icon-only rail
- **Expand**: Click chevron-right button → sidebar expands back to 256px with text labels
- **Active state**: Current page link highlighted in blue with dot indicator
- **Navigation**: All 8 links navigate correctly (Dashboard, Portföyüm, Hisse Takibi, Global Piyasalar, Açıklamalar, Alarmlar, YZ Analiz, Ayarlar)

## Lint & Typecheck

```bash
npm run lint       # ESLint
npm run typecheck  # TypeScript strict mode
```

## Known Issues

- `npm run build` might fail without valid Clerk keys — this is expected. Use `npm run dev` for testing.
- The Supabase client (`src/lib/supabase.ts`) uses an untyped client to avoid complex type inference issues with `@supabase/supabase-js` v2. Type safety is enforced at the function signature level in `src/lib/db/queries.ts`.
- Toaster component from `sonner` requires the `theme="dark"` prop to match the dark UI.
