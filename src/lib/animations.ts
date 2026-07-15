import type { MotionProps } from "framer-motion";

/**
 * Reusable fadeUp helper — opacity + y-translate, fires once when scrolled
 * into view. Use for BELOW-the-fold content (SearchChanged, Mission, Solution,
 * CTA, Footer). Spread the result onto a motion.* element:
 *
 *   <motion.div {...fadeUp(0.2)}>...</motion.div>
 *
 * ⚠️ Do NOT use this for position:fixed elements or above-the-fold content —
 * IntersectionObserver does not reliably fire for fixed elements or for
 * elements already in the viewport on initial mount. Use fadeUpMount instead.
 */
export const fadeUp = (delay: number): MotionProps => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, delay, ease: "easeOut" },
});

/**
 * fadeUp variant that fires on MOUNT (uses `animate`, not `whileInView`).
 * Use for ABOVE-the-fold content: Navbar (fixed) and Hero. This avoids the
 * IntersectionObserver race condition that leaves fixed/above-fold elements
 * stuck at opacity:0 on initial paint.
 */
export const fadeUpMount = (delay: number): MotionProps => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: "easeOut" },
});

/**
 * Plain fade (no translation) variant — fires on scroll into view.
 */
export const fadeIn = (delay: number): MotionProps => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, delay, ease: "easeOut" },
});
