import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * The Climax — the emotional peak of the page.
 *
 * Minimalist by design. A single question, centered on a black screen,
 * that fades in slowly and holds. No parallax, no morphing, no dots —
 * just the question and the silence around it.
 *
 * The question is bilingual-friendly but written in Vietnamese to match
 * the user's language: "Nơi bạn viết, hay nơi máy móc trả lời?"
 * ("Where you write, or where machines answer?")
 *
 * Implementation: 200vh section with a sticky inner. The question fades
 * in during the first 30% of scroll, holds at full opacity through the
 * middle, then fades slightly at the end as the CTA approaches.
 */

const QUESTION_LINE_1 = "Nơi bạn viết,";

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
      setProgress(Math.max(0, Math.min(1, (window.scrollY - absTop) / scrollHeight)));
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

  // Line 1 fades in [0.1, 0.3], holds, fades slightly at end
  const line1Opacity = lerp(progress, 0.1, 0.3, 0, 1);
  // Line 2 fades in [0.35, 0.55], holds, fades slightly at end
  const line2Opacity = lerp(progress, 0.35, 0.55, 0, 1);
  // Both lines fade to 0.4 in the last 15% to prepare transition to CTA
  const ambientDim = progress > 0.85 ? lerp(progress, 0.85, 1, 1, 0.4) : 1;

  return (
    <section
      ref={sectionRef}
      className="relative flex items-center justify-center overflow-hidden"
      style={{ height: "200vh", scrollSnapAlign: "start", scrollSnapStop: "always" }}
    >
      {/* Sticky inner — the question holds in place while user scrolls */}
      <div className="sticky top-0 flex h-screen w-full items-center justify-center px-6">
        <motion.div
          style={{ opacity: ambientDim }}
          className="max-w-4xl text-center"
        >
          {/* Line 1 — large, muted */}
          <motion.p
            style={{ opacity: line1Opacity }}
            className="text-4xl font-medium tracking-[-1px] text-muted-foreground md:text-6xl lg:text-7xl"
          >
            {QUESTION_LINE_1}
          </motion.p>

          {/* Line 2 — larger, foreground, serif italic accent on "máy móc" */}
          <motion.p
            style={{ opacity: line2Opacity }}
            className="mt-6 text-5xl font-medium tracking-[-1.5px] text-foreground md:text-7xl lg:text-8xl"
          >
            hay nơi{" "}
            <span className="font-serif font-normal italic">máy móc</span>{" "}
            trả lời?
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
