"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Whether this operator has asked for less motion.
 *
 * Read as state rather than in CSS because two of the effects here are
 * JavaScript — a counter that animates and a spotlight that tracks a pointer —
 * and `@media (prefers-reduced-motion)` cannot switch those off. It starts
 * `true` so the first render is the still one: an animation that has already
 * started cannot be un-started, whereas a still figure that begins moving one
 * frame later is exactly what was asked for.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Set from a listener and from a microtask rather than straight from the
    // effect body: a synchronous setState here cascades a second render on
    // every mount, and the still first paint is correct in the meantime.
    const sync = () => setReduced(query.matches);

    queueMicrotask(sync);
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return reduced;
}

/**
 * The pointer position, as CSS custom properties on the element itself.
 *
 * The glow is painted by `.spotlight` in CSS from `--mx`/`--my`; this only
 * writes the coordinates. Written straight to the node rather than held in
 * React state on purpose — a pointermove that sets state re-renders the whole
 * subtree on every frame, and this is a decoration that must cost nothing.
 *
 * Nothing is communicated by the glow that is not also in text, so a keyboard
 * or touch user loses nothing by never triggering it.
 */
export function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  const onPointerMove = useCallback((event: React.PointerEvent<T>) => {
    const node = ref.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    node.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    node.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }, []);

  return { ref, onPointerMove };
}

/**
 * A figure that counts up to its value, once.
 *
 * The point is not delight — it is that a number arriving at rest reads as a
 * fact already there, while a number that lands tells you it was just measured.
 * This console is a live instrument and its figures should behave like readings.
 *
 * `null` means "not animating", and the caller is handed the real value. That
 * is what the server renders, what a reduced-motion operator sees, and what is
 * on screen for the one frame between mount and the first animation frame — so
 * there is no state in which this displays something untrue, only states in
 * which it is not yet moving.
 */
export function useCountUp(value: number, durationMs = 900) {
  const reduced = useReducedMotion();
  const [animated, setAnimated] = useState<number | null>(null);
  const settled = useRef(0);

  useEffect(() => {
    if (reduced) return;

    const origin = settled.current;
    if (origin === value) return;

    const start = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      const t = Math.min(1, (now - start) / durationMs);
      // Ease out cubic: fast to nearly there, then settles. A linear counter
      // reads as a loading spinner made of digits.
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimated(Math.round(origin + (value - origin) * eased));

      if (t < 1) {
        frame = requestAnimationFrame(step);
      } else {
        settled.current = value;
        setAnimated(null);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [value, durationMs, reduced]);

  return animated ?? value;
}
