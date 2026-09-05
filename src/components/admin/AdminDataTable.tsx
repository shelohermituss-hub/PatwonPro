"use client";

import { useMemo, useState } from "react";
import { Download, Search, ChevronLeft, ChevronRight, TriangleAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/EmptyState";
import { cn } from "@/lib/utils";

export interface AdminColumn<T> {
  id: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  /** Omit to exclude this column from the CSV export. */
  csvValue?: (row: T) => string | number;
  className?: string;
}

export interface AdminFilter<T> {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  predicate: (row: T, value: string) => boolean;
}

const PAGE_SIZE = 10;

function toCsv<T>(rows: T[], columns: AdminColumn<T>[]): string {
  const exportable = columns.filter((col) => col.csvValue);
  const escape = (value: string | number) => {
    const text = String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const header = exportable.map((col) => escape(col.header)).join(",");
  const lines = rows.map((row) => exportable.map((col) => escape(col.csvValue!(row))).join(","));
  return [header, ...lines].join("\n");
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generic list-page table for the admin back-office: search + filters +
 * pagination + CSV export + loading/empty/error states in one place, so
 * every admin route doesn't reimplement all five (spec requirement).
 */
export function AdminDataTable<T>({
  data,
  columns,
  filters = [],
  searchPlaceholder = "Chèche...",
  searchPredicate,
  getRowKey,
  onRowClick,
  state = "ready",
  emptyTitle = "Pa gen rezilta",
  emptyDescription = "Ajiste rechèch la oswa filt yo.",
  errorMessage = "Nou pa t ka chaje done yo. Eseye ankò.",
  exportFilename = "export.csv",
  initialFilterValues,
}: {
  data: T[];
  columns: AdminColumn<T>[];
  filters?: AdminFilter<T>[];
  searchPlaceholder?: string;
  searchPredicate?: (row: T, query: string) => boolean;
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  state?: "ready" | "loading" | "error";
  emptyTitle?: string;
  emptyDescription?: string;
  errorMessage?: string;
  exportFilename?: string;
  /** Pre-selects a filter dropdown — used to deep-link from a KPI tile straight into a filtered list. */
  initialFilterValues?: Record<string, string>;
}) {
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>(initialFilterValues ?? {});
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let rows = data;
    if (search.trim() && searchPredicate) {
      rows = rows.filter((row) => searchPredicate(row, search.trim().toLowerCase()));
    }
    for (const filter of filters) {
      const value = filterValues[filter.id];
      if (value && value !== "all") {
        rows = rows.filter((row) => filter.predicate(row, value));
      }
    }
    return rows;
  }, [data, search, searchPredicate, filters, filterValues]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function updateFilter(id: string, value: string) {
    setFilterValues((prev) => ({ ...prev, [id]: value }));
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {searchPredicate && (
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" aria-hidden />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              className="pl-9"
            />
          </div>
        )}
        {filters.map((filter) => (
          <Select
            key={filter.id}
            value={filterValues[filter.id] ?? "all"}
            onValueChange={(value) => updateFilter(filter.id, value ?? "all")}
          >
            <SelectTrigger className="w-auto min-w-[160px]">
              <SelectValue placeholder={filter.label}>
                {(value: string) =>
                  value === "all" || !value
                    ? `${filter.label} — Tout`
                    : (filter.options.find((o) => o.value === value)?.label ?? filter.label)
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">{filter.label} — Tout</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        ))}
        <Button
          type="button"
          variant="outline"
          className="ml-auto"
          disabled={filtered.length === 0}
          onClick={() => downloadCsv(toCsv(filtered, columns), exportFilename)}
        >
          <Download data-icon="inline-start" aria-hidden />
          Ekspòte CSV
        </Button>
      </div>

      {state === "loading" ? (
        <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : state === "error" ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-danger/30 bg-danger/5 py-16 text-center">
          <TriangleAlert className="size-8 text-danger" aria-hidden />
          <p className="text-sm font-medium text-danger">{errorMessage}</p>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col.id} className={col.className}>
                      {col.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((row) => (
                  <TableRow
                    key={getRowKey(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(onRowClick && "cursor-pointer hover:bg-muted/50")}
                  >
                    {columns.map((col) => (
                      <TableCell key={col.id} className={col.className}>
                        {col.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-text-secondary">
              <span>
                Paj {currentPage} sou {totalPages} · {filtered.length} rezilta
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Paj anvan"
                >
                  <ChevronLeft aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Paj apre"
                >
                  <ChevronRight aria-hidden />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
