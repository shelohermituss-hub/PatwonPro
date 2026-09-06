import { Logo } from "@/components/Logo";

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
          <Logo size={28} className="shrink-0 rounded-md" />
          <span className="text-lg font-bold">PatwonPro</span>
        </div>

        <div className="relative flex flex-1 items-center justify-center" aria-hidden>
          <div className="grid w-16 grid-cols-2 gap-1.5">
            <div className="col-start-1 row-start-2 aspect-square rounded-md bg-white shadow-lg shadow-black/10 motion-safe:animate-[auth-hero-block-a_5s_ease-in-out_infinite]" />
            <div className="col-start-2 row-start-2 aspect-square rounded-md bg-white shadow-lg shadow-black/10 motion-safe:animate-[auth-hero-block-b_5s_ease-in-out_infinite]" />
            <div className="col-start-2 row-start-1 aspect-square rounded-md bg-white shadow-lg shadow-black/10 motion-safe:animate-[auth-hero-block-c_5s_ease-in-out_infinite]" />
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
