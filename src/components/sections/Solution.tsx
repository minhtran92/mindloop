import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// THE STRAIGHTENING LINE
//
// A single SVG path that morphs from a chaotic zigzag (the noise) into a
// clean straight line (clarity) as the user scrolls.
//
// Story: Mindloop takes the tangled mess of feeds and helps your thinking
// straighten out — one line, one direction, one clear thought.
//
// The path is generated from N control points. At progress=0 they're
// scattered randomly (chaos). At progress=1 they're collinear (clarity).
// We interpolate linearly between the two states.
// ─────────────────────────────────────────────────────────────────────────────

const POINT_COUNT = 24;
const VIEW_WIDTH = 600;
const VIEW_HEIGHT = 200;

/** Deterministic PRNG so chaos looks the same every render. */
function prng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/** Generate the chaos positions (random scatter along x, jittered y). */
const CHAOS_POINTS: [number, number][] = (() => {
  const rand = prng(7);
  return Array.from({ length: POINT_COUNT }, (_, i) => {
    const x = (i / (POINT_COUNT - 1)) * VIEW_WIDTH;
    // Heavy vertical jitter — looks tangled
    const y = VIEW_HEIGHT / 2 + (rand() - 0.5) * VIEW_HEIGHT * 0.85;
    return [x, y];
  });
})();

/** Generate the clarity positions (perfectly straight horizontal line). */
const CLARITY_POINTS: [number, number][] = Array.from(
  { length: POINT_COUNT },
  (_, i) => {
    const x = (i / (POINT_COUNT - 1)) * VIEW_WIDTH;
    const y = VIEW_HEIGHT / 2;
    return [x, y];
  }
);

/** Linear interpolation between two points. */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Build an SVG path string from points (smoothed via simple line-to). */
function buildPath(points: [number, number][], smoothness: number): string {
  if (points.length === 0) return "";
  // Apply Catmull-Rom-ish smoothing by averaging neighbors when smoothness > 0
  const smoothed = points.map((p, i) => {
    if (i === 0 || i === points.length - 1 || smoothness === 0) return p;
    const prev = points[i - 1];
    const next = points[i + 1];
    return [
      lerp(p[0], (prev[0] + next[0]) / 2, smoothness),
      lerp(p[1], (prev[1] + next[1]) / 2, smoothness),
    ] as [number, number];
  });
  return smoothed
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`)
    .join(" ");
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SECTION
// ─────────────────────────────────────────────────────────────────────────────

export function Solution() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  // Native scroll listener — reliable under Lenis + sticky sections.
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

  // Interpolate points from chaos → clarity based on progress.
  // Use an ease-out curve so the line straightens faster at first, then
  // settles into perfect clarity at the end.
  const easedProgress = 1 - Math.pow(1 - progress, 2);
  const currentPoints = CHAOS_POINTS.map((chaos, i) => {
    const clarity = CLARITY_POINTS[i];
    return [
      lerp(chaos[0], clarity[0], easedProgress),
      lerp(chaos[1], clarity[1], easedProgress),
    ] as [number, number];
  });

  // Smoothing: more smooth as progress increases (the chaos is jagged,
  // clarity is already smooth). At progress=0, no smoothing (raw zigzag).
  // At progress=1, full smoothing (but it's already a straight line).
  const smoothness = easedProgress * 0.6;
  const pathD = buildPath(currentPoints, smoothness);

  // Line opacity — fades in slightly at the very start, holds, then
  // brightens as it straightens (the "clarity" reveal).
  const lineOpacity = 0.4 + progress * 0.6;
  const lineWidth = 1.5 + progress * 1.5;

  // Caption text changes at key moments
  let caption: string;
  let captionOpacity: number;
  if (progress < 0.15) {
    caption = "This is your feed today.";
    captionOpacity = 1;
  } else if (progress < 0.3) {
    caption = "A tangle of signals.";
    captionOpacity = 1;
  } else if (progress < 0.55) {
    caption = "Slowly, it sorts itself.";
    captionOpacity = 1;
  } else if (progress < 0.8) {
    caption = "Until there is only one direction.";
    captionOpacity = 1;
  } else {
    caption = "Clarity.";
    captionOpacity = 1;
  }

  return (
    <section
      ref={sectionRef}
      id="use-cases"
      className="relative border-t border-border/30 scroll-mt-20"
      style={{ height: "300vh" }}
    >
      {/* Sticky viewport — the line morph plays out here */}
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6">
        {/* The line — centered, large */}
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          className="h-[120px] w-full max-w-3xl md:h-[200px] md:max-w-4xl"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            d={pathD}
            fill="none"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth={lineWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: lineOpacity, transition: "stroke-width 0.2s ease" }}
          />
        </svg>

        {/* Caption — large, centered below the line */}
        <div className="mt-12 md:mt-16 text-center">
          <motion.p
            key={caption}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: captionOpacity, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-4xl font-medium tracking-[-1px] text-foreground md:text-6xl lg:text-7xl"
          >
            {caption === "Clarity." ? (
              <span className="font-serif font-normal italic">{caption}</span>
            ) : (
              caption
            )}
          </motion.p>
        </div>
      </div>

      {/* Closing line after the sticky block releases */}
      <div className="flex min-h-screen items-center justify-center px-6">
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl text-center text-3xl font-medium tracking-[-1px] md:text-5xl lg:text-6xl"
        >
          Less noise, less friction — more{" "}
          <span className="font-serif font-normal italic text-foreground">
            meaning
          </span>{" "}
          for everyone involved.
        </motion.p>
      </div>
    </section>
  );
}
