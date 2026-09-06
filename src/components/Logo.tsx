import { cn } from "@/lib/utils";

/**
 * PatwonPro's real mark ("Pillar & Frame" — Concept 3 Refined, from the
 * Claude Design handoff). A central pillar (the owner, at the center of
 * the business) held by a modular corner frame, grounded by a small
 * emerald foundation bar — no literal figure/crown/shield.
 *
 * The mark's navy/blue/green palette is fixed and independent of the
 * app's indigo UI theme (`--primary`) so it stays stable across the app,
 * receipts, signage and uniforms regardless of future theme changes —
 * see the construction notes in the design handoff. Never recolor these
 * via CSS custom properties tied to the UI theme.
 */
const FRAME_BLUE = "#2563EB";
const FOUNDATION_GREEN = "#16A34A";
const NAVY = "#0B1F3A";

export function Logo({
  size = 32,
  tone = "navy",
  className,
}: {
  size?: number;
  /** Pillar color — "navy" on light/white surfaces, "white" on dark/saturated ones (e.g. the auth hero gradient). */
  tone?: "navy" | "white";
  className?: string;
}) {
  const pillar = tone === "white" ? "#FFFFFF" : NAVY;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="PatwonPro"
    >
      <path
        d="M16,32 V14 H34 M86,14 H104 V32 M16,88 V106 H34 M104,88 V106 H86"
        stroke={FRAME_BLUE}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <rect x="52" y="24" width="16" height="62" rx="8" fill={pillar} />
      <rect x="44" y="90" width="32" height="10" rx="5" fill={FOUNDATION_GREEN} />
    </svg>
  );
}

/**
 * App-icon tile variant — bakes in the navy rounded-square background
 * instead of relying on the surface behind it, for contexts with no
 * page background to inherit (favicon/PWA icons, print). Not used
 * inline in the UI; kept here so the icon assets under public/icons/
 * and public/brand/ are generated from the same source as `Logo`.
 */
export function LogoTile({ size = 120, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="PatwonPro"
    >
      <rect width="120" height="120" rx="24" fill={NAVY} />
      <path
        d="M22,36 V22 H36 M84,22 H98 V36 M22,84 V98 H36 M98,84 V98 H84"
        stroke={FRAME_BLUE}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <rect x="53" y="30" width="14" height="52" rx="7" fill="#FFFFFF" />
      <rect x="46" y="86" width="28" height="9" rx="4.5" fill={FOUNDATION_GREEN} />
    </svg>
  );
}

/**
 * The "PatwonPro" logotype — Sora (the mark's fixed brand typeface, see
 * `--font-brand` in globals.css), "Pro" a heavier weight and the brand
 * blue to distinguish the product tier from the name. On dark/saturated
 * surfaces (`tone="white"`) both words stay plain white — the two-tone
 * navy/blue treatment is reserved for light surfaces where it reads
 * clearly (sidebar, landing nav/footer, login form column).
 */
export function Wordmark({
  tone = "navy",
  className,
}: {
  tone?: "navy" | "white";
  className?: string;
}) {
  if (tone === "white") {
    return (
      <span className={cn("font-brand font-bold text-white", className)}>
        PatwonPro
      </span>
    );
  }
  return (
    <span className={cn("font-brand font-bold text-[#0B1F3A]", className)}>
      Patwon<span className="font-extrabold text-[#2563EB]">Pro</span>
    </span>
  );
}
