"use client";

import { useEffect } from "react";

/**
 * Runs `onPresent` once on mount if `?<param>=1` is in the URL, then strips the
 * param so a refresh doesn't re-trigger it. Used by dashboard quick actions
 * (e.g. /admin/quotations?new=1 opens the builder straight away).
 *
 * Reads window.location directly so pages don't need a Suspense boundary for
 * useSearchParams.
 */
export function useQueryFlag(param: string, onPresent: () => void) {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get(param) !== "1") return;
    url.searchParams.delete(param);
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    onPresent();
    // Only on mount — the flag is a one-shot instruction from the link that opened the page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [param]);
}
