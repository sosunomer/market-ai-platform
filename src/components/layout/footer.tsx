import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]">
      <div className="flex flex-col items-center justify-between gap-4 px-4 py-4 md:flex-row md:px-6">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Market AI Platform. Tüm hakları
          saklıdır.
        </p>
        <nav className="flex gap-4 text-xs text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground">
            Kullanım Koşulları
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Gizlilik Politikası
          </Link>
          <Link href="/contact" className="hover:text-foreground">
            İletişim
          </Link>
        </nav>
      </div>
    </footer>
  );
}
