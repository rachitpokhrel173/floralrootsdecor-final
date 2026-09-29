"use client";

import { useEffect, useState } from "react";

/** Tracks a CSS media query. Returns false during SSR and the first client render. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** True below Tailwind's `md` breakpoint (768px). */
export function useIsMobile() {
  return useMediaQuery("(max-width: 767px)");
}
