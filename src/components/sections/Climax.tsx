import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * The Climax — the emotional peak of the page.
 *
 * A tall, mostly-empty section (300vh) where a single sentence reveals
 * itself word by word as the user scrolls. The deliberate emptiness forces
 * a pause — a moment of reflection between the Solution story and the CTA.
 *
 * Sentence: "The internet has lost its curiosity. We're bringing it back."
 *
 * The first half fades in slowly during the first half of the scroll.
 * The second half — "We're bringing it back." — fades in during the
 * second half, with "back" in serif italic for emphasis.
 *
 * Scroll-snap-align: start ensures the browser pauses here on proximity,
 * giving the user a beat to absorb the message before the CTA takes over.
 */

const LINE_1 = "The internet has lost its curiosity.";
const LINE_2_PREFIX = "We're bringing it ";
const LINE_2_HIGHLIGHT = "back";

export function Climax() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Line 1 reveals during [0.15, 0.5]
  const line1Opacity = useTransform(scrollYProgress, [0.15, 0.35, 0.5], [0, 1, 1]);
  const line1Y = useTransform(scrollYProgress, [0.15, 0.35], [40, 0]);

  // Line 2 reveals during [0.55, 0.85]
  const line2Opacity = useTransform(scrollYProgress, [0.55, 0.7, 0.85], [0, 1, 1]);
  const line2Y = useTransform(scrollYProgress, [0.55, 0.7], [40, 0]);

  // Subtle ambient fade at the very end — preparing the transition to CTA
  const ambientOpacity = useTransform(scrollYProgress, [0.85, 1], [1, 0.3]);

  return (
    <section
      ref={sectionRef}
      className="relative flex items-center justify-center overflow-hidden"
      style={{ height: "300vh", scrollSnapAlign: "start", scrollSnapStop: "always" }}
    >
      {/* Sticky inner — the text holds in place while user scrolls through */}
      <div className="sticky top-0 flex h-screen w-full items-center justify-center px-6">
        <motion.div
          style={{ opacity: ambientOpacity }}
          className="max-w-3xl text-center"
        >
          {/* Line 1 */}
          <motion.p
            style={{ opacity: line1Opacity, y: line1Y }}
            className="text-3xl font-medium tracking-[-0.5px] text-muted-foreground md:text-5xl lg:text-6xl"
          >
            {LINE_1}
          </motion.p>

          {/* Line 2 */}
          <motion.p
            style={{ opacity: line2Opacity, y: line2Y }}
            className="mt-8 text-3xl font-medium tracking-[-0.5px] text-foreground md:text-5xl lg:text-6xl"
          >
            {LINE_2_PREFIX}
            <span className="font-serif font-normal italic">
              {LINE_2_HIGHLIGHT}
            </span>
            .
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
