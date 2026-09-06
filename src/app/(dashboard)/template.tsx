import { PageFade } from "@/components/motion/PageFade";

/**
 * `template.tsx` remounts on every navigation (unlike `layout.tsx`,
 * which persists the sidebar/shell) — this is what gives each dashboard
 * page a fresh entrance animation, including a `?period=` change on
 * `/reports` that re-navigates to the "same" route.
 */
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return <PageFade>{children}</PageFade>;
}
