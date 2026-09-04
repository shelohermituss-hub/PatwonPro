export default function PlatformAdminPage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold">PatwonPro — Admin</h1>
      <p className="text-text-secondary">
        Konsòl entèn ekip PatwonPro la (wòl <code>platform_admin</code>) —
        jesyon abònman, tablèt, sipò, ak kont atravè tout boutik. Separe de
        `(dashboard)` (yon sèl boutik) paske `platform_admin` pa gen
        `store_id` (gade <code>docs/DATA_MODEL.md</code>). Gadyen aksè reyèl
        (verifye wòl la nan sesyon an) ap fèt nan{" "}
        <code>docs/PROMPTS/02-auth.md</code>.
      </p>
    </div>
  );
}
