"use client";

import * as React from "react";
import {
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  createColumnHelper,
} from "@tanstack/react-table";
import { ArrowUpDown, Download, Star, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials, formatCurrency, formatDate } from "@/lib/utils";
import { exportCustomersToCsv } from "@/lib/utils/export-customers";
import type { CustomerWithStats } from "@/lib/data/customers";
import { toast } from "sonner";

const columnHelper = createColumnHelper<CustomerWithStats>();

const columns = [
  columnHelper.display({
    id: "client",
    header: "Customer",
    cell: ({ row }) => (
      <div className="flex items-center gap-3 min-w-[180px]">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-gold/15 text-gold-dark text-xs">
            {getInitials(row.original.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            {row.original.is_favorite && <Star className="h-3 w-3 fill-gold text-gold shrink-0" />}
            <p className="text-sm font-medium truncate">{row.original.full_name}</p>
          </div>
          <p className="text-xs text-muted-foreground truncate">{row.original.phone}</p>
        </div>
      </div>
    ),
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (info) => <span className="text-sm text-muted-foreground">{info.getValue() ?? "—"}</span>,
  }),
  columnHelper.accessor("bookingsCount", {
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="h-8 px-2 -ml-2 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Bookings <ArrowUpDown className="ml-1.5 h-3 w-3" />
      </Button>
    ),
    cell: (info) => <span className="text-sm font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor("totalSpent", {
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="h-8 px-2 -ml-2 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Total Spent <ArrowUpDown className="ml-1.5 h-3 w-3" />
      </Button>
    ),
    cell: (info) => formatCurrency(info.getValue()),
  }),
  columnHelper.accessor("lastEventType", {
    header: "Last Event",
    cell: (info) => info.getValue() ?? "—",
  }),
  columnHelper.display({
    id: "tags",
    header: "Tags",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1 max-w-[160px]">
        {(row.original.tags ?? []).slice(0, 2).map((t) => (
          <Badge key={t} variant="outline" className="text-[10px]">
            {t}
          </Badge>
        ))}
        {(row.original.tags ?? []).length === 0 && (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>
    ),
  }),
  columnHelper.accessor("created_at", {
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="h-8 px-2 -ml-2 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Joined <ArrowUpDown className="ml-1.5 h-3 w-3" />
      </Button>
    ),
    cell: (info) => <span className="text-xs text-muted-foreground">{formatDate(info.getValue())}</span>,
  }),
];

export function CustomersDataTable({
  data,
  isLoading,
  onRowClick,
}: {
  data: CustomerWithStats[];
  isLoading?: boolean;
  onRowClick: (customer: CustomerWithStats) => void;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "created_at", desc: true }]);
  const [search, setSearch] = React.useState("");
  const [favoritesOnly, setFavoritesOnly] = React.useState(false);

  const filtered = React.useMemo(() => {
    let rows = data;
    if (favoritesOnly) rows = rows.filter((c) => c.is_favorite);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (c) =>
          c.full_name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.email ?? "").toLowerCase().includes(q)
      );
    }
    return rows;
  }, [data, search, favoritesOnly]);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  function handleExport() {
    exportCustomersToCsv(filtered, `customers-${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success(`Exported ${filtered.length} customer${filtered.length === 1 ? "" : "s"} to CSV`);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Search by name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button
            variant={favoritesOnly ? "luxury" : "outline"}
            size="sm"
            onClick={() => setFavoritesOnly((v) => !v)}
          >
            <Star className="h-3.5 w-3.5" /> Favorites
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 text-left font-medium whitespace-nowrap">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {columns.map((_, ci) => (
                      <td key={ci} className="px-4 py-3.5">
                        <Skeleton className="h-5 w-full max-w-[120px]" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!isLoading && table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="py-16">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Users className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        No customers yet — they&apos;re created automatically from bookings.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading &&
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick(row.original)}
                    className="border-b border-border last:border-0 hover:bg-accent/50 cursor-pointer transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)} ·{" "}
          {filtered.length} total
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="h-3.5 w-3.5" /> Prev
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
