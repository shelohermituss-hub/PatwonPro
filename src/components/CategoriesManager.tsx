"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLiveQuery } from "dexie-react-hooks";
import { LoaderCircle, MoreVertical } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { pullProducts } from "@/lib/sync/products";
import { createClient } from "@/lib/supabase/client";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import {
  categorySchema,
  type CategoryFormInput,
  type CategoryFormOutput,
} from "@/lib/validations/category";
import type { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Field, FieldGroup, FieldError } from "@/components/ui/field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function CategoriesManager() {
  const { profile } = useCurrentProfile();
  const categories = useLiveQuery(() => db.categories.toArray(), []);
  const [renameTarget, setRenameTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  useEffect(() => {
    if (!profile?.store_id) return;
    void pullProducts(profile.store_id);
  }, [profile?.store_id]);

  const sorted = useMemo(
    () => [...(categories ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
  );

  async function refresh() {
    if (profile?.store_id) await pullProducts(profile.store_id);
  }

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <AddCategoryForm storeId={profile?.store_id ?? null} onCreated={refresh} />

      {categories === undefined ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          title="Ou poko gen kategori"
          description="Ajoute yon kategori pou klase pwodwi ou yo."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Non</TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">Aksyon</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium text-foreground">
                    {category.name}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Aksyon pou ${category.name}`}
                          />
                        }
                      >
                        <MoreVertical className="size-4" aria-hidden />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={() => setRenameTarget(category)}>
                            Chanje non
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleteTarget(category)}
                          >
                            Efase
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <RenameCategoryDialog
        category={renameTarget}
        onOpenChange={(open) => !open && setRenameTarget(null)}
        onRenamed={refresh}
      />

      <DeleteCategoryDialog
        category={deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onDeleted={refresh}
      />
    </div>
  );
}

function AddCategoryForm({
  storeId,
  onCreated,
}: {
  storeId: string | null;
  onCreated: () => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormInput, unknown, CategoryFormOutput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(values: CategoryFormOutput) {
    if (!storeId) {
      toast.error("Nou pa t ka jwenn boutik ou. Rekonekte epi eseye ankò.");
      return;
    }

    const supabase = createClient();
    const now = new Date().toISOString();
    const { error } = await supabase.from("categories").insert({
      id: crypto.randomUUID(),
      store_id: storeId,
      name: values.name,
      created_at: now,
      updated_at: now,
    });

    if (error) {
      toast.error("Nou pa t ka ajoute kategori a.");
      return;
    }

    await onCreated();
    reset();
    toast.success("Kategori ajoute.");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex items-start gap-3">
      <FieldGroup>
        <Field data-invalid={!!errors.name || undefined}>
          <Input
            aria-label="Non kategori a"
            placeholder="Non kategori a"
            className="min-h-12"
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={isSubmitting} className="min-h-12">
        {isSubmitting && (
          <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />
        )}
        Ajoute
      </Button>
    </form>
  );
}

function RenameCategoryDialog({
  category,
  onOpenChange,
  onRenamed,
}: {
  category: Category | null;
  onOpenChange: (open: boolean) => void;
  onRenamed: () => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormInput, unknown, CategoryFormOutput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: category?.name ?? "" },
    values: category ? { name: category.name } : undefined,
  });

  async function onSubmit(values: CategoryFormOutput) {
    if (!category) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("categories")
      .update({ name: values.name, updated_at: new Date().toISOString() })
      .eq("id", category.id);

    if (error) {
      toast.error("Nou pa t ka chanje non kategori a.");
      return;
    }

    await onRenamed();
    reset();
    onOpenChange(false);
    toast.success("Non kategori chanje.");
  }

  return (
    <Dialog open={!!category} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chanje non kategori</DialogTitle>
          <DialogDescription>Antre nouvo non an.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.name || undefined}>
              <Input
                aria-label="Nouvo non kategori a"
                className="min-h-12"
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Anile
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />
              )}
              Anrejistre
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteCategoryDialog({
  category,
  onOpenChange,
  onDeleted,
}: {
  category: Category | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => Promise<void>;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!category) return;
    setIsDeleting(true);

    const supabase = createClient();
    const { error } = await supabase.from("categories").delete().eq("id", category.id);

    setIsDeleting(false);

    if (error) {
      toast.error("Nou pa t ka efase kategori a.");
      return;
    }

    await onDeleted();
    onOpenChange(false);
    toast.success("Kategori efase.");
  }

  return (
    <AlertDialog open={!!category} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Efase {category?.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Pwodwi ki nan kategori sa a ap rete, men yo ap san kategori.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Anile</AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            onClick={handleDelete}
            className="bg-danger text-white hover:bg-danger/90"
          >
            {isDeleting && (
              <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />
            )}
            Efase
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
