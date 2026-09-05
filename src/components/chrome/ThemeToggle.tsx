"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { springTap, useReducedMotion } from "@/lib/motion";

type Theme = "light" | "dark";
const STORAGE_KEY = "raptric:theme";

function readEffectiveTheme(): Theme {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === "light" || explicit === "dark") return explicit;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// Site-header icon toggle. The design tokens already fully support both
// themes (prefers-color-scheme + a [data-theme] override in globals.css)
// — this is the missing control, not new theming work. `theme` starts
// as a fixed "light" guess (matching the server, which has no window)
// and is corrected in an effect once mounted — same hydration-safe
// pattern as useReducedMotion, so the page's real colors never flash
// (the blocking script in layout.tsx's <head> handles that), only this
// button's own icon may swap a frame after mount.
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setTheme(readEffectiveTheme());
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // private browsing / storage disabled — theme just won't persist
    }
  }

  const Icon = theme === "dark" ? Moon : Sun;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        mounted
          ? theme === "dark"
            ? "Switch to light theme"
            : "Switch to dark theme"
          : "Toggle theme"
      }
      className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full hover:bg-surface-sunk"
    >
      <AnimatePresence mode="wait" initial={false}>
        {reduceMotion ? (
          <Icon key={theme} className="size-5" aria-hidden />
        ) : (
          <motion.span
            key={theme}
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={springTap}
            className="grid place-items-center"
          >
            <Icon className="size-5" aria-hidden />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
