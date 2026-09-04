import {
  Wallet,
  TriangleAlert,
  PackageX,
  Users,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const kpis = [
  {
    label: "Vant jodi a",
    value: "—",
    hint: "Total vant depi maten an",
    icon: Wallet,
  },
  {
    label: "Kredi an reta",
    value: "—",
    hint: "Kliyan ki gen dèt an reta",
    icon: TriangleAlert,
  },
  {
    label: "Stòk ba",
    value: "—",
    hint: "Pwodwi anba sèy alèt la",
    icon: PackageX,
  },
  {
    label: "Kliyan aktif",
    value: "—",
    hint: "Kliyan ak yon achte resan",
    icon: Users,
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-foreground">Tablo Bò</h1>
        <p className="text-text-secondary">Rezime jodi a pou boutik ou.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(({ label, value, hint, icon: Icon }) => (
          <Card key={label}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  {label}
                </CardTitle>
                <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold text-foreground">{value}</p>
              <CardDescription>{hint}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vant resan</CardTitle>
          <CardDescription>
            Done reyèl ap parèt isit la lè POS la konekte ak Dexie/Supabase
            (`docs/PROMPTS/04-pos.md`, `06-reports.md`).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-secondary">
            Poko gen okenn vant anrejistre.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
