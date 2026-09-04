import { Icons } from "@/lib/icons";
import { SUPPORT_TICKET_STATUS_LABELS } from "@/lib/subscription/labels";
import { formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import type { SupportTicket } from "@/types";

const STATUS_VARIANT: Record<SupportTicket["status"], "default" | "secondary" | "outline"> = {
  open: "default",
  in_progress: "secondary",
  resolved: "outline",
  closed: "outline",
};

export function SupportTicketList({ tickets }: { tickets: SupportTicket[] }) {
  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
        <Icons.support className="size-8" aria-hidden />
        <p className="text-sm text-text-secondary">Ou poko gen tikè sipò.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {tickets.map((ticket) => (
        <li
          key={ticket.id}
          className="flex flex-col gap-1 rounded-lg border border-border p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-foreground">{ticket.subject}</span>
            <Badge variant={STATUS_VARIANT[ticket.status]}>
              {SUPPORT_TICKET_STATUS_LABELS[ticket.status]}
            </Badge>
          </div>
          <p className="text-sm text-text-secondary">{ticket.message}</p>
          <span className="text-xs text-text-secondary">
            {formatDateTime(ticket.created_at)}
          </span>
        </li>
      ))}
    </ul>
  );
}
