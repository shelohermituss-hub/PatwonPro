import Link from "next/link";

const tabs = [
  { href: "/pos", label: "POS" },
  { href: "/products", label: "Pwodwi" },
  { href: "/credits", label: "Kredi" },
  { href: "/reports", label: "Rapò" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1 pb-20">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 flex border-t border-black/10 bg-surface">
        {tabs.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center justify-center py-3 text-sm text-text-secondary hover:text-primary"
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
