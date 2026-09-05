const STATS = [
  { value: "100%", label: "Entèfas an Kreyòl" },
  { value: "0", label: "Koneksyon obligatwa pou vann" },
  { value: "2", label: "Mwayen peman mobil entegre" },
  { value: "3", label: "Wòl: pwopriyetè, anplwaye, admin" },
];

export function Stats() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-center md:gap-16">
        <div className="grid grid-cols-2 gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <span className="text-4xl font-extrabold text-foreground sm:text-5xl">
                {stat.value}
              </span>
              <span className="text-sm text-text-secondary">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="max-w-md">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Bati pou reyalite yon boutik ayisyen
          </h2>
          <p className="mt-3 text-text-secondary">
            Pa gen konpwomi sou lang, koneksyon, oswa mwayen peman — PatwonPro
            fèt dapre fason boutik yo reyèlman travay an Ayiti.
          </p>
        </div>
      </div>
    </section>
  );
}
