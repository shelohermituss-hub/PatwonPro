export default function PosPage() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">Pwen Vant</h1>
      <p className="text-text-secondary">
        Ekran vant lan ap konstwi nan <code>docs/PROMPTS/04-pos.md</code>. Li ap
        travay offline gras a Dexie (<code>src/lib/db</code>) e senkronize atravè{" "}
        <code>src/lib/sync</code>.
      </p>
    </div>
  );
}
