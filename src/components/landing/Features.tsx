import { Icons } from "@/lib/icons";

const FEATURES = [
  {
    icon: Icons.pos,
    title: "Pwen Vant (POS)",
    description: "Vann rapid nan yon ekran senp, ki fèt pou tablèt ak telefòn.",
  },
  {
    icon: Icons.product,
    title: "Jesyon Envantè",
    description: "Swiv chak pwodwi, pri, ak kantite ki rete an stòk an tan reyèl.",
  },
  {
    icon: Icons.stock,
    title: "Antre Stòk",
    description: "Anrejistre reapwovizyonman ak korije stòk san pèdi istwa a.",
  },
  {
    icon: Icons.credit,
    title: "Kredi Kliyan",
    description: "Swiv lajan kliyan dwe ou ak resevwa peman pati pa pati.",
  },
  {
    icon: Icons.reports,
    title: "Rapò ak Estatistik",
    description: "Wè vant, pwofi, ak pwodwi ki pi mache pou pran pi bon desizyon.",
  },
  {
    icon: Icons.sync,
    title: "Travay San Entènèt",
    description: "Kontinye vann menm san koneksyon — done yo senkronize apre.",
  },
];

export function Features() {
  return (
    <section id="fonksyonalite" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Tout sa yon boutik bezwen, nan yon sèl app
        </h2>
        <p className="mt-3 text-lg text-text-secondary">
          Pa gen plizyè zouti pou jere — PatwonPro regwoupe vant, envantè, ak
          kredi nan yon sèl kote.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6"
          >
            <feature.icon className="size-9" aria-hidden />
            <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
            <p className="text-sm text-text-secondary">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
