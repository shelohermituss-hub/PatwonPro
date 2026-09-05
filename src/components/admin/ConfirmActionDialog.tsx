"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
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
import { useAdminActor } from "@/components/admin/AdminSessionProvider";
import { recordAuditEvent } from "@/lib/admin/auditLog";

/**
 * Generic confirmation for every sensitive admin action (financial,
 * destructive, suspension, device change — per the spec). Confirming
 * runs `onConfirm` (the real mutation, if given) then always appends a
 * real `audit_logs` entry — if `onConfirm` throws (e.g. RLS denies the
 * write for this admin's role), no audit entry is written either.
 */
export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Konfime",
  destructive = false,
  action,
  resourceType,
  resourceId,
  storeId = null,
  successMessage,
  onConfirm,
  onConfirmed,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  action: string;
  resourceType: string;
  resourceId: string;
  storeId?: string | null;
  successMessage: string;
  /** Performs the real mutation. Runs before the audit log write. */
  onConfirm?: () => Promise<void>;
  onConfirmed?: () => void;
}) {
  const actor = useAdminActor();
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await onConfirm?.();
      await recordAuditEvent({
        actorId: actor.id,
        actorRole: actor.role,
        action,
        resourceType,
        resourceId,
        storeId,
      });
      onOpenChange(false);
      toast.success(successMessage);
      onConfirmed?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Yon erè fèt.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Anile</AlertDialogCancel>
          <AlertDialogAction
            variant={destructive ? "destructive" : "default"}
            disabled={submitting}
            onClick={handleConfirm}
          >
            {submitting && <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
