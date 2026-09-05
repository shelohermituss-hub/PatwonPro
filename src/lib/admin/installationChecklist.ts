import type { InstallationChecklistItem } from "@/types/admin";

/** Fixed checklist every field installation follows, per the spec ("chak enstalasyon suiv menm chèklis pou evite erè"). */
export const INSTALLATION_CHECKLIST_TEMPLATE: InstallationChecklistItem[] = [
  { label: "Verifye idantite boutik la", done: false },
  { label: "Anrejistre adrès egzat la", done: false },
  { label: "Note nimewo seri a", done: false },
  { label: "Fè siyen esè oswa kontra a", done: false },
  { label: "Enstale rakousi PWA a", done: false },
  { label: "Kreye kont pwopriyetè a", done: false },
  { label: "Ajoute stòk inisyal", done: false },
  { label: "Reyalize yon vant tès", done: false },
  { label: "Fòme pwopriyetè + vandè", done: false },
  { label: "Teste senkwonizasyon", done: false },
  { label: "Pran foto remiz", done: false },
];
