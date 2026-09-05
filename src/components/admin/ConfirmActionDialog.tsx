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
 * always appends an audit entry, even for the mock actions this phase
 * only simulates (no real backend write yet).
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
  onConfirmed?: () => void;
}) {
  const actor = useAdminActor();
  const [submitting, setSubmitting] = useState(false);

  function handleConfirm() {
    setSubmitting(true);
    recordAuditEvent({
      actorId: actor.id,
      actorRole: actor.role,
      action,
      resourceType,
      resourceId,
      storeId,
    });
    setSubmitting(false);
    onOpenChange(false);
    toast.success(successMessage);
    onConfirmed?.();
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
