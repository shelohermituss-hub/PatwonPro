import Link from "next/link";
import { Icons } from "@/lib/icons";
import { buttonVariants } from "@/components/ui/button";
import { formatCurrencyHTG } from "@/lib/format";
import { cn } from "@/lib/utils";

const MOCK_PRODUCTS = [
  { name: "Diri", price: 250, icon: Icons.product },
  { name: "Luil", price: 400, icon: Icons.product },
  { name: "Savon", price: 75, icon: Icons.product },
  { name: "Sik", price: 150, icon: Icons.product },
];

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center md:py-24">
      <div className="flex flex-col gap-6">
        <span className="inline-flex w-fit items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-secondary">
          Fèt pou ti ak mwayen boutik ann Ayiti
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Jere boutik ou, menm san entènèt.
        </h1>
        <p className="max-w-md text-lg text-text-secondary">
          Vant, envantè, ak kredi kliyan nan yon sèl app senp an Kreyòl —
          done ou yo toujou disponib, menm lè koneksyon an ale.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/register" className={cn(buttonVariants(), "min-h-12 px-6 text-base")}>
            Kòmanse gratis
          </Link>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline" }), "min-h-12 px-6 text-base")}
          >
            Konekte
          </Link>
        </div>
        <p className="text-sm text-text-secondary">
          Pa bezwen kat kredi. Kreye kont boutik ou an mwens pase 2 minit.
        </p>
      </div>

      <div className="relative mx-auto w-full max-w-sm">
        <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-gradient-start via-brand-gradient-via to-brand-gradient-end opacity-20 blur-2xl" />
        <div className="rounded-3xl border border-border bg-surface p-4 shadow-xl">
          <div className="mb-3 flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-danger/70" />
            <span className="size-2.5 rounded-full bg-warning/70" />
            <span className="size-2.5 rounded-full bg-success/70" />
            <span className="ml-2 text-xs font-medium text-text-secondary">Pwen Vant</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {MOCK_PRODUCTS.map((product) => (
              <div
                key={product.name}
                className="flex flex-col items-start gap-1 rounded-lg border border-border p-2.5"
              >
                <product.icon className="size-5" aria-hidden />
                <span className="text-xs font-medium text-foreground">{product.name}</span>
                <span className="text-xs font-bold text-foreground">
                  {formatCurrencyHTG(product.price)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between rounded-lg bg-primary px-3 py-2.5">
            <span className="text-sm font-medium text-primary-foreground">Total</span>
            <span className="text-sm font-bold text-primary-foreground">
              {formatCurrencyHTG(875)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
