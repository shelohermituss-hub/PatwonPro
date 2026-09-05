import { Icons } from "@/lib/icons";

const METHODS = [
  {
    icon: Icons.credit,
    name: "MonCash",
    description: "Peman mobil Digicel — kliyan ou yo peye dirèkteman ak telefòn yo.",
  },
  {
    icon: Icons.profit,
    name: "NatCash",
    description: "Peman mobil Natcom — yon lòt fason rapid pou kliyan ou peye.",
  },
];

export function PaymentMethods() {
  return (
    <section className="border-y border-border bg-surface px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Aksepte peman kote kliyan ou ye
          </h2>
          <p className="mt-3 text-lg text-text-secondary">
            PatwonPro entegre dirèkteman ak mwayen peman mobil ki pi itilize
            an Ayiti, anplis kach ak vant a kredi.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-2xl gap-6 sm:grid-cols-2">
          {METHODS.map((method) => (
            <div
              key={method.name}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-6"
            >
              <method.icon className="size-9" aria-hidden />
              <h3 className="text-lg font-semibold text-foreground">{method.name}</h3>
              <p className="text-sm text-text-secondary">{method.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
