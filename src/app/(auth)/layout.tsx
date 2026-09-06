import Image from "next/image";
import { Logo, Wordmark } from "@/components/Logo";

/**
 * Split-screen shell for /login and /register. Deliberately not a copy
 * of design-system/'s illustration (generic SaaS kit, not PatwonPro —
 * see docs/DESIGN_AUDIT.md §5/§6). The hero panel is the one place the
 * brand gradient (public/brand/) gets used at full strength — everywhere
 * else in the app stays solid --primary, per docs/CLAUDE.md's "pas de
 * gradients excessifs".
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

      <div className="relative hidden w-[42%] shrink-0 overflow-hidden bg-gradient-to-br from-brand-gradient-start via-brand-gradient-via to-brand-gradient-end bg-[length:200%_200%] motion-safe:animate-[auth-hero-aurora_16s_ease-in-out_infinite] md:flex md:flex-col md:justify-between md:p-12">
        <div
          className="absolute -right-24 -top-24 size-96 rounded-full bg-white/10 motion-safe:animate-[auth-hero-blob-a_11s_ease-in-out_infinite]"
          aria-hidden
        />
        <div
          className="absolute -bottom-32 -left-16 size-72 rounded-full bg-white/10 motion-safe:animate-[auth-hero-blob-b_9s_ease-in-out_infinite]"
          style={{ animationDelay: "-3s" }}
          aria-hidden
        />

        <div className="relative flex items-center gap-2 text-white">
          <Logo size={28} tone="white" />
          <Wordmark tone="white" className="text-lg" />
        </div>

        <div className="relative flex flex-1 items-center justify-center py-6">
          <div className="w-52 overflow-hidden rounded-3xl border border-white/20 shadow-2xl shadow-black/30 motion-safe:animate-[auth-hero-card_6s_ease-in-out_infinite]">
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
