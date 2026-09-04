"use client";

import { use } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { PackageX } from "lucide-react";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/ProductForm";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  // Dexie's .get() resolves to `undefined` both while the query hasn't run
  // yet AND when the id truly doesn't exist — wrapping the result is what
  // makes those two cases distinguishable below.
  const result = useLiveQuery(async () => {
    const product = await db.products.get(id);
    return { found: !!product, product };
  }, [id]);

  if (result === undefined) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="flex max-w-2xl flex-col gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!result.found || !result.product) {
    return (
      <div className="flex flex-col items-center gap-3 p-16 text-center">
        <PackageX className="size-10 text-text-secondary" aria-hidden />
        <p className="font-medium text-foreground">
          Nou pa jwenn pwodwi sa a
        </p>
        <p className="text-sm text-text-secondary">
          Li ka efase, oswa li poko senkwonize sou aparèy sa a.
        </p>
        <Link href="/products" className={cn(buttonVariants(), "mt-2 min-h-12")}>
          Tounen nan Pwodwi
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-foreground">
          Modifye {result.product.name}
        </h1>
        <p className="text-text-secondary">
          Chanjman yo disponib imedyatman, menm san entènèt.
        </p>
      </div>

      <ProductForm product={result.product} />
    </div>
  );
}
