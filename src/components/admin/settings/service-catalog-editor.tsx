"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { updateServiceCatalogAction } from "@/actions/settings-actions";
import type { ServiceCatalogItem } from "@/lib/validations/settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function slugify(label: string) {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function ServiceCatalogEditor({ initialValues }: { initialValues: ServiceCatalogItem[] }) {
  const [items, setItems] = useState<ServiceCatalogItem[]>(initialValues);
  const [newLabel, setNewLabel] = useState("");
  const [isPending, startTransition] = useTransition();
  const isDirty = JSON.stringify(items) !== JSON.stringify(initialValues);

  function addItem() {
    const label = newLabel.trim();
    if (!label) return;
    const key = slugify(label);
    if (!key) {
      toast.error("Enter a valid service name");
      return;
    }
    if (items.some((i) => i.key === key)) {
      toast.error("A service with that name already exists");
      return;
    }
    setItems((prev) => [...prev, { key, label }]);
    setNewLabel("");
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  function updateLabel(key: string, label: string) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, label } : i)));
  }

  function handleSave() {
    startTransition(async () => {
      const res = await updateServiceCatalogAction(items);
      if (res.success) {
        toast.success("Service catalog updated");
      } else {
        toast.error(res.error ?? "Failed to update — you may need admin/manager access");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg font-normal">Service Catalog</CardTitle>
        <CardDescription>
          Reference list used for quotations and invoices. The public booking form&apos;s Step 3
          uses a fixed set of icons and isn&apos;t driven by this list yet.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.key} className="flex items-center gap-2">
            <Input
              value={item.label}
              onChange={(e) => updateLabel(item.key, e.target.value)}
              className="flex-1"
            />
            <span className="hidden sm:inline text-xs text-muted-foreground font-mono w-32 truncate">
              {item.key}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeItem(item.key)}
              aria-label={`Remove ${item.label}`}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">No services yet — add one below.</p>
        )}

        <div className="flex gap-2 pt-1">
          <Input
            placeholder="e.g. Fireworks"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addItem();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addItem}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="button" variant="luxury" onClick={handleSave} disabled={isPending || !isDirty}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
