"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Copy, ExternalLink, MessageCircle, RefreshCw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  markQuotationSharedAction,
  regenerateQuotationShareLinkAction,
} from "@/actions/quotation-actions";
import {
  quotationShareMessage,
  quotationShareUrl,
  whatsAppShareLink,
} from "@/lib/quotation-share";
import type { QuotationWithBooking } from "@/lib/data/quotations";

/**
 * Share handlers for a quotation's public client link. Shared by the preview
 * dialog's Share menu and the quotations table row menu.
 */
export function useQuotationShareActions(companyName: string, onChanged?: () => void) {
  const [, startTransition] = useTransition();

  function linkFor(q: QuotationWithBooking) {
    if (!q.share_token) {
      toast.error("Share link unavailable", {
        description: "Run the latest database migration (0012_quotation_share_token) first.",
      });
      return null;
    }
    return quotationShareUrl(q.share_token);
  }

  // Sharing a draft promotes it to "sent" (and the booking to quotation_sent).
  function markShared(q: QuotationWithBooking) {
    if (q.status !== "draft") return;
    startTransition(async () => {
      const res = await markQuotationSharedAction(q.id);
      if (!res.success) {
        toast.error("Link shared, but couldn't mark as sent", { description: res.error });
        return;
      }
      toast.success(`${q.quotation_number} marked as sent`);
      onChanged?.();
    });
  }

  function shareWhatsApp(q: QuotationWithBooking) {
    const url = linkFor(q);
    if (!url) return;
    // Open synchronously inside the click handler so it isn't popup-blocked.
    window.open(
      whatsAppShareLink(q.booking?.phone, quotationShareMessage(q, companyName, url)),
      "_blank",
      "noopener,noreferrer"
    );
    markShared(q);
  }

  async function copyLink(q: QuotationWithBooking) {
    const url = linkFor(q);
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Client link copied", { description: "Anyone with this link can view the quotation." });
      markShared(q);
    } catch {
      toast.error("Couldn't copy automatically", { description: url });
    }
  }

  function openClientView(q: QuotationWithBooking) {
    const url = linkFor(q);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  function resetLink(q: QuotationWithBooking) {
    if (!confirm(`Reset the share link for ${q.quotation_number}? The old link will stop working.`)) {
      return;
    }
    startTransition(async () => {
      const res = await regenerateQuotationShareLinkAction(q.id);
      if (!res.success) {
        toast.error("Couldn't reset link", { description: res.error });
        return;
      }
      toast.success("Share link reset", { description: "Previously shared links no longer work." });
      onChanged?.();
    });
  }

  return { shareWhatsApp, copyLink, openClientView, resetLink };
}

export function QuotationShareMenu({
  quotation,
  companyName,
  onChanged,
}: {
  quotation: QuotationWithBooking;
  companyName: string;
  onChanged?: () => void;
}) {
  const { shareWhatsApp, copyLink, openClientView, resetLink } = useQuotationShareActions(
    companyName,
    onChanged
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          <Share2 className="mr-2 h-4 w-4" /> Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Client can view &amp; download — no login needed
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={() => shareWhatsApp(quotation)}>
          <MessageCircle className="mr-2 h-4 w-4 text-[#25D366]" />
          Send on WhatsApp
          {quotation.booking?.phone ? "" : " (pick chat)"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => copyLink(quotation)}>
          <Copy className="mr-2 h-4 w-4" /> Copy client link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openClientView(quotation)}>
          <ExternalLink className="mr-2 h-4 w-4" /> Open client view
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => resetLink(quotation)}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Reset link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
