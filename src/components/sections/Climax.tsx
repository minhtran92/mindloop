import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * The Climax — the emotional peak of the page.
 *
 * A tall, mostly-empty section (300vh) where a single sentence reveals
 * itself word by word as the user scrolls. The deliberate emptiness forces
 * a pause — a moment of reflection between the Solution story and the CTA.
 *
 * Sentence: "The internet has lost its curiosity. We're bringing it back."
 *
 * Implementation:
 *   Uses a native window scroll listener + useState for progress (not
 *   framer-motion's useScroll/useTransform — those proved unreliable with
 *   Lenis + sticky sections). Opacity/y are computed inline from progress
 *   and applied via motion.p style props.
 */

const LINE_1 = "The internet has lost its curiosity.";
const LINE_2_PREFIX = "We're bringing it ";
const LINE_2_HIGHLIGHT = "back";

// Linear interpolation helper
function lerp(v: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  if (v <= inMin) return outMin;
  if (v >= inMax) return outMax;
  const t = (v - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}

export function Climax() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId: number | null = null;

    function recompute() {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const absTop = rect.top + window.scrollY;
      const scrollHeight = Math.max(0, rect.height - window.innerHeight);
      if (scrollHeight <= 0) {
        setProgress(0);
        return;
      }
      setProgress(
        Math.max(0, Math.min(1, (window.scrollY - absTop) / scrollHeight))
      );
    }

    function onScroll() {
      if (rafId != null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        recompute();
      });
    }

    recompute();
    const t1 = setTimeout(recompute, 200);
    const t2 = setTimeout(recompute, 1000);
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("lenis", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll, { capture: true } as AddEventListenerOptions);
      window.removeEventListener("lenis", onScroll);
      window.removeEventListener("resize", onScroll);
      clearTimeout(t1);
      clearTimeout(t2);
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, []);

  // Derive opacities + y from progress
  const line1Opacity = lerp(progress, 0.15, 0.35, 0, 1);
  const line1Y = lerp(progress, 0.15, 0.35, 40, 0);
  const line2Opacity = lerp(progress, 0.55, 0.7, 0, 1);
  const line2Y = lerp(progress, 0.55, 0.7, 40, 0);
  const ambientOpacity = lerp(progress, 0.85, 1, 1, 0.3);

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
