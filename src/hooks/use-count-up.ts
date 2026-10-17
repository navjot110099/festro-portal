"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/** Eases a number from its previous value to `target`. Returns the target directly when motion is reduced. */
export function useCountUp(target: number, { duration = 1100, delay = 0 }: { duration?: number; delay?: number } = {}) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const from = fromRef.current;
    const timeout = window.setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 4);
        const next = from + (target - from) * eased;
        setValue(next);
        fromRef.current = next;
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      window.clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [target, duration, delay, reduce]);

  return reduce ? target : value;
}
