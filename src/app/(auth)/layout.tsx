import Image from "next/image";
import { Logo, Wordmark } from "@/components/Logo";

/**
 * Split-screen shell for /login and /register. Deliberately not a copy
 * of design-system/'s illustration (generic SaaS kit, not PatwonPro —
 * see docs/DESIGN_AUDIT.md §5/§6). The hero panel is plain white with a
 * border separating it from the form column — the user explicitly asked
 * to drop the earlier brand-gradient treatment in favor of a plain
 * background, so the gradient/aurora/blob decoration is gone here.
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

      <div className="hidden w-[42%] shrink-0 border-l border-border bg-surface md:flex md:flex-col md:justify-between md:p-12">
        <div className="flex items-center gap-2 text-foreground">
          <Logo size={28} />
          <Wordmark className="text-lg" />
        </div>

        <div className="flex flex-1 items-center justify-center py-6">
          <div className="w-52 overflow-hidden rounded-3xl border border-border shadow-lg motion-safe:animate-[auth-hero-card_6s_ease-in-out_infinite]">
            <Image
              src="/images/auth/shop-owner-phone.jpg"
              alt="Yon kòmèsan k ap konsilte telefòn li nan boutik li"
              width={900}
              height={1125}
              className="aspect-[4/5] w-full object-cover"
              priority
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 text-foreground">
          <p className="text-3xl font-extrabold leading-tight">
            Jere boutik ou san pran tèt.
          </p>
          <p className="max-w-xs text-base text-text-secondary">
            Vant, stòk, ak kredi kliyan — menm san entènèt.
          </p>
        </div>
      </div>
    </div>
  );
}
