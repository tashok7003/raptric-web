"use client";

import { useEffect, useState } from "react";

// Lets a page-specific fixed bottom bar (e.g. AddToCartBar) tell the
// global ConsentBanner to stack above it instead of overlapping it —
// both are fixed/inset-x-0/bottom-0, so without this the banner's
// higher z-index silently covers, and intercepts clicks on, whatever
// renders under it. Same pub/sub shape as compareTray.ts.
let activeBars = 0;
const EVENT = "raptric:bottom-bar-change";

export function useRegisterBottomBar(active: boolean = true) {
  useEffect(() => {
    if (!active) return;
    activeBars += 1;
    window.dispatchEvent(new Event(EVENT));
    return () => {
      activeBars -= 1;
      window.dispatchEvent(new Event(EVENT));
    };
  }, [active]);
}

export function useHasBottomBar(): boolean {
  const [has, setHas] = useState(false);
  useEffect(() => {
    const sync = () => setHas(activeBars > 0);
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);
  return has;
}
