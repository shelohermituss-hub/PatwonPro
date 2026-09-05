import { Icons } from "@/lib/icons";

const STEPS = [
  {
    number: "1",
    icon: Icons.customers,
    title: "Kreye kont boutik ou",
    description: "Antre non boutik ou ak imèl ou — pa gen kat kredi ki mande.",
  },
  {
    number: "2",
    icon: Icons.setup,
    title: "Ajoute pwodwi ou yo",
    description: "Mete pwodwi, pri, ak kantite an stòk yo an kèk minit.",
  },
  {
    number: "3",
    icon: Icons.sales,
    title: "Kòmanse vann",
    description: "Louvri Pwen Vant lan epi kòmanse sèvi kliyan ou yo, san oswa avèk entènèt.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="kijan-li-mache"
      className="border-y border-border bg-surface px-4 py-16 sm:px-6 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Kòman li mache
          </h2>
          <p className="mt-3 text-lg text-text-secondary">
            Twa etap, epi boutik ou pare pou vann.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.number} className="flex flex-col items-center gap-3 text-center">
              <div className="relative">
                <step.icon className="size-12" aria-hidden />
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {step.number}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="max-w-xs text-sm text-text-secondary">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
