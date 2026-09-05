import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CtaBanner() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-gradient-start via-brand-gradient-via to-brand-gradient-start px-8 py-12 sm:px-14 sm:py-16">
        <div
          className="absolute -right-16 -top-16 size-64 rounded-full bg-brand-gradient-end/20"
          aria-hidden
        />
        <div
          className="absolute -bottom-20 -left-10 size-56 rounded-full bg-brand-gradient-end/10"
          aria-hidden
        />
        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-md">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Pare pou modènize jesyon boutik ou?
            </h2>
            <p className="mt-3 text-white/80">
              Kreye kont boutik ou gratis epi kòmanse vann jodi a — san kat
              kredi, san angajman.
            </p>
          </div>
          <Link
            href="/register"
            className={cn(
              buttonVariants(),
              "min-h-12 shrink-0 bg-white px-6 text-base text-foreground hover:bg-white/90",
            )}
          >
            Kòmanse gratis
          </Link>
        </div>
      </div>
    </section>
  );
}
