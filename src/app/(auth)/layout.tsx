import { Store } from "lucide-react";

/**
 * Split-screen shell for /login and /register. Deliberately not a copy
 * of design-system/'s illustration (generic SaaS kit, not Jere Boutik —
 * see docs/DESIGN_AUDIT.md §5/§6): flat brand-blue panel with a single
 * geometric accent, no gradient wash.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <div className="flex flex-1 items-center justify-center px-6 py-12 md:px-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>

      <div className="relative hidden w-[42%] shrink-0 overflow-hidden bg-primary md:flex md:flex-col md:justify-between md:p-12">
        <div
          className="absolute -right-24 -top-24 size-96 rounded-full bg-primary-hover"
          aria-hidden
        />
        <div
          className="absolute -bottom-32 -left-16 size-72 rounded-full bg-primary-hover/60"
          aria-hidden
        />

        <div className="relative flex items-center gap-2 text-white">
          <Store className="size-6" aria-hidden />
          <span className="text-lg font-bold">Jere Boutik</span>
        </div>

        <div className="relative flex flex-col gap-2 text-white">
          <p className="text-3xl font-extrabold leading-tight">
            Jere boutik ou san pran tèt.
          </p>
          <p className="max-w-xs text-base text-white/80">
            Vant, stòk, ak kredi kliyan — menm san entènèt.
          </p>
        </div>
      </div>
    </div>
  );
}
