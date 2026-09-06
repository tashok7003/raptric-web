"use client";

import { useEffect, useState } from "react";

// Compare is tray-only (2a) — never a nav item. Persisted in localStorage
// since it's a per-viewer convenience that only needs to survive
// navigation between the listing, PDP and compare pages, not be shared
// or synced.
const KEY = "raptric:compare";
const MAX = 3;

export function getCompareIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function setCompareIds(ids: string[]) {
  window.localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("raptric:compare-change"));
}

export function toggleCompare(id: string): string[] {
  const ids = getCompareIds();
  const next = ids.includes(id)
    ? ids.filter((x) => x !== id)
    : ids.length < MAX
      ? [...ids, id]
      : ids;
  setCompareIds(next);
  return next;
}

export function clearCompare() {
  setCompareIds([]);
}

/** Drops any id not in `validIds` from the stored selection — for ids
 * that no longer resolve to a real product (deleted, or from a stale
 * browser that had them selected before a reseed/recreate changed their
 * underlying row). Without this, a rider who selected two now-gone
 * products is stuck forever with a tray showing raw database ids and a
 * /compare page that silently renders nothing. */
export function pruneCompareIds(validIds: string[]) {
  const ids = getCompareIds();
  const next = ids.filter((id) => validIds.includes(id));
  if (next.length !== ids.length) setCompareIds(next);
}

export const COMPARE_MAX = MAX;

/** Live compare-selection state, kept in sync across every mounted
 * consumer (CompareTray, ProductCard's toggle, ...) via the same events
 * toggleCompare/clearCompare dispatch. */
export function useCompareIds(): string[] {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    setIds(getCompareIds());
    const onChange = () => setIds(getCompareIds());
    window.addEventListener("raptric:compare-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("raptric:compare-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return ids;
}
