import { useEffect, useState } from "react";
import type { Transition } from "framer-motion";

/**
 * Apple-quality motion, built from the actual SwiftUI spring model rather
 * than guessed stiffness/damping numbers. SwiftUI's `.spring(response:
 * dampingFraction:)` is defined in terms of a mass-spring-damper system:
 *
 *   stiffness = (2π / response)² × mass
 *   damping   = 4π × dampingFraction × mass / response
 *
 * `response` is roughly the time (seconds) for the spring to reach its
 * target the first time; `dampingFraction` 1 = no bounce, <1 = overshoot.
 * Converting through this formula (rather than picking Framer Motion's
 * stiffness/damping directly) is what makes these feel like iOS/macOS
 * rather than "a spring, approximately".
 *
 * RAPTRIC's own visual identity (Archivo/Mukta, Lucide, the 8e token
 * palette) is untouched — only the interaction physics borrow from
 * Apple: springs instead of eased durations, position+velocity-aware
 * drag dismissal on sheets, press feedback via scale, not colour alone.
 *
 * Every component using these must call useReducedMotion() and fall
 * back to the plain fade/duration tokens when true (see ui/Button.tsx).
 */

function appleSpring(
  response: number,
  dampingFraction: number,
  mass = 1,
): Transition {
  const stiffness = Math.pow((2 * Math.PI) / response, 2) * mass;
  const damping = (4 * Math.PI * dampingFraction * mass) / response;
  return { type: "spring", stiffness, damping, mass };
}

/** UIButton-style press feedback — fast, controlled, no overshoot. */
export const springTap = appleSpring(0.28, 0.9);

/** Default UIKit/SwiftUI transition — navigation pushes, toggles, list rows. */
export const springStandard = appleSpring(0.5, 0.825);

/** UISheetPresentationController — a modal sheet sliding up, slightly
 * softer than the standard spring so it reads as "settling", not snapping. */
export const springSheet = appleSpring(0.45, 0.8);

/** A hair of overshoot — the "added to cart" / success-state bounce, used
 * sparingly (Apple reserves real bounce for delight moments, not chrome). */
export const springBouncy = appleSpring(0.55, 0.65);

/** Hover/lift on cards — slower and heavier than a tap, nothing snaps. */
export const springHover = appleSpring(0.4, 0.86, 1.2);

// Back-compat aliases for earlier call sites.
export const springSnappy = springTap;
export const springGentle = springStandard;

export const fadeEnterExit: Transition = {
  duration: 0.12,
  ease: [0.32, 0.72, 0, 1],
};

export const pressScale = { scale: 0.97 };

/**
 * Framer Motion's spring type only supports two keyframes, so a
 * three-value bounce (1 → 1.05 → 1, the Button `pulse` prop) has to be
 * a tween. This "back out" curve is the standard stand-in for a spring
 * overshoot when you need more than two keyframes — same visual
 * language as springBouncy, just not literally simulated as one.
 */
export const pulseTransition: Transition = {
  duration: 0.4,
  ease: [0.34, 1.56, 0.64, 1],
};

/** Page-entrance transition (Next.js template.tsx doesn't support exit
 * animations across navigations, so this is enter-only — a restrained
 * version of a UINavigationController push). */
export const pageEnter = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: springStandard,
};

/**
 * Apple sheets dismiss on velocity OR position, not position alone — a
 * fast short flick closes it even if the sheet only moved a little.
 * Mirrors UIKit's interactive dismissal heuristic.
 */
export function shouldDismissSheet(offsetY: number, velocityY: number) {
  return offsetY > 120 || velocityY > 800;
}

/**
 * A hydration-safe replacement for framer-motion's own useReducedMotion():
 * that hook reads window.matchMedia synchronously during render, which is
 * always `false` on the server (no window) but can already be `true` on
 * the client's first render. Any component that branches its structure or
 * gesture props (whileTap, whileHover, ...) on that value hits a real
 * SSR/CSR hydration mismatch whenever the visitor's OS/browser prefers
 * reduced motion. Deferring detection to an effect keeps the server and
 * first client render identical; the preference then applies a moment
 * after mount, same as any other client-only state update.
 */
export function useReducedMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mql.matches);
    const onChange = () => setReduceMotion(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return reduceMotion;
}
