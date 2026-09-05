import type { ComponentPropsWithoutRef } from "react";

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
 */
function glassIcon(file: string, label: string): AppIconComponent {
  return function GlassIcon({ alt, ...props }) {
    // Every call site marks these `aria-hidden` (decorative, next to a
    // real text label) except the handful passing their own `alt` —
    // mirrors how the equivalent Lucide icons carried no accessible text
    // of their own either.
    // eslint-disable-next-line @next/next/no-img-element -- fixed tiny SVG icons rendered at arbitrary caller-chosen sizes across 30+ call sites; next/image's optimization pipeline buys nothing for static vector assets and would force width/height props everywhere Lucide never needed them.
    return <img src={`/icons/glass/${file}.svg`} alt={alt ?? ""} title={label} {...props} />;
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
