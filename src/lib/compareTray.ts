"use client";

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

export const COMPARE_MAX = MAX;
