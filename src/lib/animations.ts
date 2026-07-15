import type { MotionProps } from "framer-motion";

/**
 * Reusable fadeUp helper — opacity + y-translate, fires once when in view.
 * Pass a stagger delay (seconds). Spread the result onto a motion.* element:
 *
 *   <motion.div {...fadeUp(0.2)}>...</motion.div>
 */
export const fadeUp = (delay: number): MotionProps => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, delay, ease: "easeOut" },
});

/**
 * Plain fade (no translation) variant.
 */
export const fadeIn = (delay: number): MotionProps => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, delay, ease: "easeOut" },
});
