import Link from "next/link";
import { Logo } from "@/components/Logo";

const LINK_COLUMNS = [
  {
    title: "Pwodwi",
    links: [
      { href: "#fonksyonalite", label: "Fonksyonalite" },
      { href: "#kijan-li-mache", label: "Kòman li mache" },
      { href: "#kesyon", label: "Kesyon" },
    ],
  },
  {
    title: "Kont",
    links: [
      { href: "/login", label: "Konekte" },
      { href: "/register", label: "Kreye kont" },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-[1.5fr_1fr_1fr]">
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Logo size={28} className="shrink-0 rounded-md" />
              <span className="text-lg font-semibold text-foreground">PatwonPro</span>
            </Link>
            <p className="max-w-xs text-sm text-text-secondary">
              Jesyon boutik senp ak fyab pou ti ak mwayen antrepriz an Ayiti.
            </p>
          </div>

          {LINK_COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6 text-sm text-text-secondary">
          © {new Date().getFullYear()} PatwonPro. Tout dwa rezève.
        </div>
      </div>
    </footer>
  );
}
