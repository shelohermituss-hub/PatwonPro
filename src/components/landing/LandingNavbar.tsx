import Link from "next/link";
import { Logo } from "@/components/Logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#fonksyonalite", label: "Fonksyonalite" },
  { href: "#kijan-li-mache", label: "Kòman li mache" },
  { href: "#kesyon", label: "Kesyon" },
];

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={28} className="shrink-0 rounded-md" />
          <span className="text-lg font-semibold text-foreground">PatwonPro</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-secondary transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost" }), "min-h-10")}
          >
            Konekte
          </Link>
          <Link href="/register" className={cn(buttonVariants(), "min-h-10")}>
            Kòmanse gratis
          </Link>
        </div>
      </div>
    </header>
  );
}
