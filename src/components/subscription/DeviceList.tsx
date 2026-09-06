import { EmptyState } from "@/components/EmptyState";
import { DEVICE_STATUS_LABELS } from "@/lib/subscription/labels";
import { formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { RequestReplacementSheet } from "@/components/subscription/RequestReplacementSheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Device } from "@/types";

const STATUS_VARIANT: Record<Device["status"], "default" | "secondary" | "destructive"> = {
  deployed_active: "default",
  deployed_trial: "default",
  in_stock: "secondary",
  reserved: "secondary",
  returned: "secondary",
  refurbished: "secondary",
  repair: "destructive",
  lost: "destructive",
  retired: "destructive",
};

export function DeviceList({ devices, storeId }: { devices: Device[]; storeId: string }) {
  if (devices.length === 0) {
    return (
      <EmptyState
        title="Pa gen tablèt anrejistre pou boutik ou."
        compact
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Aparèy</TableHead>
            <TableHead>Nimewo Seri</TableHead>
            <TableHead>Estati</TableHead>
            <TableHead>Dènye fwa li aktif</TableHead>
            <TableHead>Aksyon</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => (
            <TableRow key={device.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                    {device.model_photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage URLs aren't in next.config's image domains.
                      <img src={device.model_photo_url} alt="" className="size-full object-cover" />
                    ) : (
                      <span className="text-[9px] text-text-secondary">—</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{device.name}</span>
                    <span className="text-xs text-text-secondary">
                      {[device.brand, device.model].filter(Boolean).join(" ") || device.device_code || "—"}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-text-secondary">{device.serial_number ?? "—"}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[device.status]}>
                  {DEVICE_STATUS_LABELS[device.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-text-secondary">
                {device.last_seen_at ? formatDateTime(device.last_seen_at) : "—"}
              </TableCell>
              <TableCell>
                <RequestReplacementSheet
                  storeId={storeId}
                  deviceId={device.id}
                  deviceName={device.name}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
