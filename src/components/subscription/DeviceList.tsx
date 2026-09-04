import { Icons } from "@/lib/icons";
import { DEVICE_STATUS_LABELS } from "@/lib/subscription/labels";
import { formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
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
  active: "default",
  inactive: "secondary",
  blocked: "destructive",
};

export function DeviceList({ devices }: { devices: Device[] }) {
  if (devices.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
        <Icons.tablet className="size-8" aria-hidden />
        <p className="text-sm text-text-secondary">
          Pa gen tablèt anrejistre pou boutik ou.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Non</TableHead>
            <TableHead>Estati</TableHead>
            <TableHead>Dènye fwa li aktif</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => (
            <TableRow key={device.id}>
              <TableCell className="font-medium text-foreground">{device.name}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[device.status]}>
                  {DEVICE_STATUS_LABELS[device.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-text-secondary">
                {device.last_seen_at ? formatDateTime(device.last_seen_at) : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
