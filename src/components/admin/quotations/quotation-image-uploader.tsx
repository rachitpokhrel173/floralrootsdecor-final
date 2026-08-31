"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ImageLightbox } from "./image-lightbox";

const MAX_SIZE_MB = 5;
const MAX_IMAGES = 12;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const BUCKET = "quotation-assets";

/**
 * Multi-image picker for the quotation builder. Uploads straight to the
 * public `quotation-assets` bucket and hands the parent an ordered list of
 * public URLs. Mirrors the settings LogoUploader, extended for many files.
 */
export function QuotationImageUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // allow re-selecting the same file later
    if (files.length === 0) return;

    if (value.length + files.length > MAX_IMAGES) {
      toast.error(`You can attach up to ${MAX_IMAGES} images`);
      return;
    }

    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: please use PNG, JPG, or WEBP`);
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`${file.name}: image must be under ${MAX_SIZE_MB}MB`);
        return;
      }
    }

    setIsUploading(true);
    try {
      const supabase = createClient();
      const uploaded: string[] = [];

      for (const file of files) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `quotation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { cacheControl: "3600" });

        if (uploadError) {
          toast.error(uploadError.message || "Upload failed — you may need staff access");
          continue;
        }

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }

      if (uploaded.length > 0) {
        onChange([...value, ...uploaded]);
        toast.success(uploaded.length === 1 ? "Image added" : `${uploaded.length} images added`);
      }
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((url, i) => (
          <div
            key={url}
            className="group relative h-20 w-20 overflow-hidden rounded-lg border border-border bg-muted/40"
          >
            <button
              type="button"
              onClick={() => setZoomSrc(url)}
              className="block h-full w-full"
              aria-label={`Preview image ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Reference ${i + 1}`}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </button>
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute right-1 top-1 z-10 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label={`Remove image ${i + 1}`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {value.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            <span className="text-[10px]">Add</span>
          </button>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground">
        PNG, JPG, or WEBP — up to {MAX_SIZE_MB}MB each, {MAX_IMAGES} images max.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <ImageLightbox src={zoomSrc} alt="Quotation reference" onClose={() => setZoomSrc(null)} />
    </div>
  );
}
