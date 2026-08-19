"use client";

import { useState, useTransition, type KeyboardEvent } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Save, X } from "lucide-react";
import { updateEventTypesAction } from "@/actions/settings-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function EventTypesEditor({ initialValues }: { initialValues: string[] }) {
  const [types, setTypes] = useState<string[]>(initialValues);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();
  const isDirty = JSON.stringify(types) !== JSON.stringify(initialValues);

  function addType() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (types.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("That event type already exists");
      return;
    }
    setTypes((prev) => [...prev, trimmed]);
    setDraft("");
  }

  function removeType(type: string) {
    setTypes((prev) => prev.filter((t) => t !== type));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addType();
    }
  }

  function handleSave() {
    startTransition(async () => {
      const res = await updateEventTypesAction(types);
      if (res.success) {
        toast.success("Event types updated");
      } else {
        toast.error(res.error ?? "Failed to update — you may need admin/manager access");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg font-normal">Event Types</CardTitle>
        <CardDescription>Shown as options in Step 2 of the public booking form.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {types.map((type) => (
            <Badge key={type} variant="outline" className="gap-1.5 py-1.5 pl-3 pr-2 text-sm">
              {type}
              <button
                type="button"
                onClick={() => removeType(type)}
                className="rounded-full p-0.5 hover:bg-destructive/10 hover:text-destructive transition-colors"
                aria-label={`Remove ${type}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {types.length === 0 && (
            <p className="text-sm text-muted-foreground">No event types yet — add one below.</p>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="e.g. Housewarming"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <Button type="button" variant="outline" onClick={addType}>
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
