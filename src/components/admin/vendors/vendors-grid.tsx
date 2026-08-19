"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Plus, Star, Handshake, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VendorFormDialog } from "./vendor-form-dialog";
import { VendorDetailDrawer } from "./vendor-detail-drawer";
import { useVendors } from "@/hooks/use-vendors";
import { deleteVendorAction } from "@/actions/vendor-actions";
import { VENDOR_CATEGORIES, VENDOR_CATEGORY_LABELS } from "@/lib/validations/vendor";
import { formatCurrency } from "@/lib/utils";
import type { VendorWithStats } from "@/lib/data/vendors";

export function VendorsGrid() {
  const { data: vendors, isLoading, refetch } = useVendors();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorWithStats | null>(null);
  const [selected, setSelected] = useState<VendorWithStats | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    const list = vendors ?? [];
    const term = search.trim().toLowerCase();
    return list.filter((v) => {
      const matchesCategory = categoryFilter === "all" || v.category === categoryFilter;
      const matchesSearch =
        !term || v.name.toLowerCase().includes(term) || (v.contact_person ?? "").toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [vendors, search, categoryFilter]);

  function openNew() {
    setEditingVendor(null);
    setFormOpen(true);
  }

  function openEdit(v: VendorWithStats) {
    setEditingVendor(v);
    setDrawerOpen(false);
    setFormOpen(true);
  }

  function openDetail(v: VendorWithStats) {
    setSelected(v);
    setDrawerOpen(true);
  }

  async function handleDelete(e: React.MouseEvent, v: VendorWithStats) {
    e.stopPropagation();
    if (!confirm(`Delete vendor "${v.name}"? This can't be undone.`)) return;
    const res = await deleteVendorAction(v.id);
    if (res.success) {
      toast.success("Vendor deleted");
      refetch();
    } else {
      toast.error(res.error ?? "Failed to delete vendor");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[170px] shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {VENDOR_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {VENDOR_CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" /> Add Vendor
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center border border-dashed border-border rounded-2xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Handshake className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No vendors yet — add your first partner.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((v) => (
            <Card
              key={v.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => openDetail(v)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{v.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {v.contact_person || "No contact listed"}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, v)}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-[10px]">
                    {VENDOR_CATEGORY_LABELS[v.category as keyof typeof VENDOR_CATEGORY_LABELS] ?? v.category}
                  </Badge>
                  {!v.is_active && (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      Inactive
                    </Badge>
                  )}
                  {v.rating ? (
                    <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                      <Star className="h-3 w-3 fill-gold text-gold" /> {v.rating.toFixed(1)}
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
                  <span className="text-muted-foreground">Total Paid</span>
                  <span className="font-medium">{formatCurrency(v.totalPaid)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <VendorFormDialog open={formOpen} onOpenChange={setFormOpen} editingVendor={editingVendor} onSaved={refetch} />
      <VendorDetailDrawer vendor={selected} open={drawerOpen} onOpenChange={setDrawerOpen} onEdit={openEdit} />
    </div>
  );
}
