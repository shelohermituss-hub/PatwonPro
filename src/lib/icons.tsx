import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export type AppIconComponent = (props: ComponentPropsWithoutRef<"img">) => React.JSX.Element;

/**
 * Builds a React "icon component" around a static glassmorphism SVG asset
 * (public/icons/glass/), so call sites keep the exact same shape they had
 * with Lucide (`<Icons.product className="size-5" aria-hidden />`) even
 * though these are `<img>` tags, not currentColor-driven vector components.
 * That also means these icons render with their own fixed multi-color
 * fills — a `text-*` class next to one only colors sibling text, never
 * the icon itself (see the detinted containers in KpiCard.tsx, dashboard
 * page.tsx, etc.).
 *
 * Defaulting the size here matters more than it would for an inline
 * `<svg>`: shadcn's own components size icons via CSS descendant
 * selectors that target `svg` specifically (e.g. Button's
 * `[&_svg:not([class*='size-'])]:size-4`), which never match an `<img>`
 * — without a default, an icon used bare (most `data-icon="inline-start"`
 * call sites) fell back to the raw SVG file's own intrinsic size
 * (44px, or up to 365px for a couple of the source files), blowing up
 * every button/badge that expected a ~16px glyph. `cn()` lets any
 * caller-supplied `size-*` still win via tailwind-merge.
 */
function glassIcon(file: string, label: string): AppIconComponent {
  return function GlassIcon({ alt, className, ...props }) {
    // Every call site marks these `aria-hidden` (decorative, next to a
    // real text label) except the handful passing their own `alt` —
    // mirrors how the equivalent Lucide icons carried no accessible text
    // of their own either.
    return (
      // eslint-disable-next-line @next/next/no-img-element -- fixed tiny SVG icons rendered at arbitrary caller-chosen sizes across 30+ call sites; next/image's optimization pipeline buys nothing for static vector assets and would force width/height props everywhere Lucide never needed them.
      <img
        src={`/icons/glass/${file}.svg`}
        alt={alt ?? ""}
        title={label}
        className={cn("size-4 shrink-0", className)}
        {...props}
      />
    );
  };
}

/**
 * Central registry of content icons used across the app — one semantic
 * name per concept rather than importing icon assets ad-hoc per file, so
 * a mapping only needs fixing here. Sourced from the user-provided glass-
 * morphism icon packs (Glazicons 108 + a handful of exceptions from the
 * "20 Glassmorphism icon" pack where Glazicons had no equivalent —
 * `customers`/`history`/`sms`). Lucide remains for the two things a
 * static icon pack can't cover: shadcn's own internal UI glyphs (chevron,
 * check, close — select/dialog/sheet/calendar/command/checkbox/dropdown-
 * menu/sonner) and every `LoaderCircle` spinner.
 */
export const Icons = {
  dashboard: glassIcon("home", "Tablo Bò"),
  pos: glassIcon("cart", "Pwen Vant"),
  product: glassIcon("gift", "Pwodwi"),
  stock: glassIcon("database", "Antre Stòk"),
  credit: glassIcon("credit-card", "Kredi"),
  reports: glassIcon("chart", "Rapò"),
  subscription: glassIcon("wallet", "Abònman"),
  settings: glassIcon("setting", "Paramèt"),

  sales: glassIcon("document", "Vant"),
  profit: glassIcon("currency", "Benefis"),
  alert: glassIcon("warning", "Alèt"),
  trendUp: glassIcon("arrow-circle-up", "An ogmantasyon"),
  trendDown: glassIcon("arrow-circle-down", "An bès"),
  success: glassIcon("check-circle", "Reyisi"),
  customers: glassIcon("team", "Kliyan"),
  add: glassIcon("add-circle", "Ajoute"),
  next: glassIcon("arrow-circle-right", "Kontinye"),
  back: glassIcon("arrow-circle-left", "Tounen"),
  search: glassIcon("search", "Chèche"),
  cancelled: glassIcon("warning", "Anile"),
  failed: glassIcon("cross-circle", "Echwe"),
  download: glassIcon("download", "Telechaje"),
  history: glassIcon("clock", "Istorik"),
  topRated: glassIcon("badge", "Pi bon"),
  folder: glassIcon("folder", "Kategori"),
  tablet: glassIcon("pc", "Aparèy"),
  support: glassIcon("message", "Sipò"),
  sms: glassIcon("chat", "SMS"),
  callback: glassIcon("send", "Voye"),
  transactionCount: glassIcon("document", "Tranzaksyon"),
  avgBasket: glassIcon("cart", "Panye mwayèn"),
  sync: glassIcon("arrows-square-up-down", "Senkwonizasyon"),
  setup: glassIcon("clipboard", "Konfigirasyon"),
} as const satisfies Record<string, AppIconComponent>;
