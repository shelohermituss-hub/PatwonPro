import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Tablo Bò" },
  { href: "/pos", label: "Pwen Vant (POS)" },
  { href: "/products", label: "Pwodwi" },
  { href: "/stock-entries", label: "Antre Stòk" },
  { href: "/credits", label: "Kredi kliyan" },
  { href: "/reports", label: "Rapò" },
  { href: "/subscription", label: "Abònman" },
  { href: "/settings", label: "Paramèt" },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Jere Boutik</h1>
        <p className="max-w-md text-text-secondary">
          Jere envantè, vant, ak kredi boutik ou — menm san entènèt.
        </p>
      </div>
      <nav className="grid w-full max-w-sm grid-cols-2 gap-3">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="flex min-h-[48px] items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
