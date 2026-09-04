import { ProductForm } from "@/components/ProductForm";

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-foreground">
          Ajoute Pwodwi
        </h1>
        <p className="text-text-secondary">
          Antre detay pwodwi a. Li ap disponib nan POS la imedyatman, menm
          san entènèt.
        </p>
      </div>

      <ProductForm />
    </div>
  );
}
