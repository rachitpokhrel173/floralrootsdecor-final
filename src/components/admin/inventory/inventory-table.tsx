"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Plus, Boxes, Minus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InventoryFormDialog } from "./inventory-form-dialog";
import { useInventory } from "@/hooks/use-inventory";
import { deleteInventoryItemAction, adjustStockAction } from "@/actions/inventory-actions";
import {
  INVENTORY_CATEGORIES,
  INVENTORY_CATEGORY_LABELS,
  LOW_STOCK_THRESHOLD,
} from "@/lib/validations/inventory";
import { formatCurrency } from "@/lib/utils";
import type { InventoryWithSupplier } from "@/lib/data/inventory";

export function InventoryTable() {
  const { data: items, isLoading, refetch } = useInventory();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryWithSupplier | null>(null);

  const filtered = useMemo(() => {
    const list = items ?? [];
    const term = search.trim().toLowerCase();
    return list.filter((i) => {
      const matchesCategory = categoryFilter === "all" || i.category === categoryFilter;
      const matchesLowStock = !lowStockOnly || i.quantity <= LOW_STOCK_THRESHOLD;
      const matchesSearch =
        !term || i.name.toLowerCase().includes(term) || (i.sku ?? "").toLowerCase().includes(term);
      return matchesCategory && matchesLowStock && matchesSearch;
    });
  }, [items, search, categoryFilter, lowStockOnly]);

  function openNew() {
    setEditingItem(null);
    setFormOpen(true);
  }

  function openEdit(item: InventoryWithSupplier) {
    setEditingItem(item);
    setFormOpen(true);
  }

  async function handleDelete(item: InventoryWithSupplier) {
    if (!confirm(`Delete "${item.name}"? This can't be undone.`)) return;
    const res = await deleteInventoryItemAction(item.id);
    if (res.success) {
      toast.success("Item deleted");
      refetch();
    } else {
      toast.error(res.error ?? "Failed to delete item");
    }
  }

  async function handleAdjust(item: InventoryWithSupplier, delta: number) {
    const res = await adjustStockAction(item.id, delta);
    if (!res.success) {
      toast.error(res.error ?? "Failed to update stock");
    } else {
      refetch();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2 max-w-2xl flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or SKU…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px] shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {INVENTORY_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {INVENTORY_CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={lowStockOnly ? "luxury" : "outline"}
            size="default"
            onClick={() => setLowStockOnly((v) => !v)}
          >
            <AlertTriangle className="h-3.5 w-3.5" /> Low Stock
          </Button>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" /> Add Item
        </Button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Supplier</th>
              <th className="px-4 py-3 font-medium text-center">Quantity</th>
              <th className="px-4 py-3 font-medium text-right">Value</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium w-24" />
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-4 py-3" colSpan={7}>
                    <Skeleton className="h-6 w-full" />
                  </td>
                </tr>
              ))}

            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Boxes className="h-5 w-5 text-muted-foreground" />
                    </div>
                    No inventory items found.
                  </div>
                </td>
              </tr>
            )}

            {!isLoading &&
              filtered.map((item) => {
                const isLowStock = item.quantity <= LOW_STOCK_THRESHOLD;
                return (
                  <tr key={item.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium">{item.name}</p>
                      {item.sku && <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-[10px]">
                        {INVENTORY_CATEGORY_LABELS[item.category as keyof typeof INVENTORY_CATEGORY_LABELS] ?? item.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.supplierName ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleAdjust(item, -1)}
                          disabled={item.quantity === 0}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className={`w-8 text-center font-medium ${isLowStock ? "text-red-500" : ""}`}>
                          {item.quantity}
                        </span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleAdjust(item, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {formatCurrency((item.purchase_price ?? 0) * item.quantity)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {isLowStock && (
                          <Badge variant="destructive" className="text-[10px] w-fit">
                            Low Stock
                          </Badge>
                        )}
                        <Badge variant={item.is_available ? "success" : "outline"} className="text-[10px] w-fit">
                          {item.is_available ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(item)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <InventoryFormDialog open={formOpen} onOpenChange={setFormOpen} editingItem={editingItem} onSaved={refetch} />
    </div>
  );
}
