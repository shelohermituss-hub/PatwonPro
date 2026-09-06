import { PageFade } from "@/components/motion/PageFade";

/** Same remount-per-navigation trick as `(dashboard)/template.tsx`, scoped to the form column only — the split-screen hero panel lives in `layout.tsx` and stays put. */
export default function AuthTemplate({ children }: { children: React.ReactNode }) {
  return <PageFade>{children}</PageFade>;
}
