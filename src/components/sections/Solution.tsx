import { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useKeyboardSound } from "@/hooks/useKeyboardSound";

// ─────────────────────────────────────────────────────────────────────────────
// MORPHING DOT POSITIONS
// 20 dots, 5 phases. Each phase is a set of (x, y) coordinates in the
// SVG viewBox (400 × 300, centered at 0,0 → range -200..200, -150..150).
// The dots interpolate between phases based on scroll progress.
// ─────────────────────────────────────────────────────────────────────────────

const DOT_COUNT = 20;

/** Deterministic pseudo-random generator so chaos looks the same every render. */
function prng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

type Point = [number, number];

function generatePhases(): Point[][] {
  const rand = prng(42);

  // Phase 0 — Chaos: scattered, jittered positions (the noise)
  const chaos: Point[] = Array.from({ length: DOT_COUNT }, () => [
    (rand() - 0.5) * 360,
    (rand() - 0.5) * 260,
  ]);

  // Phase 1 — Curated Feed: sorted into a clean grid (5 cols × 4 rows)
  const grid: Point[] = [];
  for (let i = 0; i < DOT_COUNT; i++) {
    const col = i % 5;
    const row = Math.floor(i / 5);
    grid.push([-160 + col * 80, -120 + row * 80]);
  }

  // Phase 2 — Writer Tools: same grid positions (the visual difference is
  // conceptual — "text" phase). We keep grid positions.
  const text: Point[] = grid;

  // Phase 3 — Community: dots form a circle, lines connect neighbors
  const circle: Point[] = [];
  for (let i = 0; i < DOT_COUNT; i++) {
    const angle = (i / DOT_COUNT) * Math.PI * 2;
    circle.push([Math.cos(angle) * 110, Math.sin(angle) * 110]);
  }

  // Phase 4 — Distribution: dots radiate outward (dual-ring)
  const radiate: Point[] = [];
  for (let i = 0; i < DOT_COUNT; i++) {
    const angle = (i / DOT_COUNT) * Math.PI * 2;
    const radius = i % 2 === 0 ? 80 : 150;
    radiate.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
  }

  return [chaos, grid, text, circle, radiate];
}

const PHASES = generatePhases();

// Scroll breakpoints for each phase transition
const PHASE_BREAKPOINTS = [0, 0.2, 0.42, 0.64, 0.86, 1];

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE CONTENT — text that changes alongside the morphing
// ─────────────────────────────────────────────────────────────────────────────

const PHASE_CONTENT = [
  {
    label: "THE NOISE",
    title: "The feed is loud.",
    description:
      "Every scroll brings a hundred voices, all shouting at once. Signal drowns in noise. You close the tab, no wiser than before.",
  },
  {
    label: "01 — CURATED FEED",
    title: "Then, the noise sorts itself.",
    description:
      "A personalised stream ranked by depth, not engagement — tuned to what you actually want to read, not what the algorithm wants you to click.",
  },
  {
    label: "02 — WRITER TOOLS",
    title: "Tools that support thinking, not replace it.",
    description:
      "A focused editor with analytics, audience insights, and AI assist that respects your voice instead of flattening it into the average.",
  },
  {
    label: "03 — COMMUNITY",
    title: "Where connection actually forms.",
    description:
      "Threaded conversations inside every issue, so readers and writers meet where the thinking happens — not in a comments section, but in the margin.",
  },
  {
    label: "04 — DISTRIBUTION",
    title: "Your work radiates outward.",
    description:
      "Cross-publish to email, web, RSS, and AI search with one click. Your writing stays portable, credited, and findable — wherever readers look.",
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// INTERPOLATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Linear interpolation between breakpoints. */
function lerpMulti(
  value: number,
  breakpoints: number[],
  outputs: number[]
): number {
  if (value <= breakpoints[0]) return outputs[0];
  if (value >= breakpoints[breakpoints.length - 1]) return outputs[outputs.length - 1];
  for (let i = 0; i < breakpoints.length - 1; i++) {
    if (value >= breakpoints[i] && value <= breakpoints[i + 1]) {
      const t = (value - breakpoints[i]) / (breakpoints[i + 1] - breakpoints[i]);
      return outputs[i] + t * (outputs[i + 1] - outputs[i]);
    }
  }
  return outputs[outputs.length - 1];
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/** Single dot whose (cx, cy) interpolates across all 5 phases. */
function MorphDot({
  index,
  progress,
}: {
  index: number;
  progress: number;
}) {
  const xs = PHASES.map((p) => p[index][0]);
  const ys = PHASES.map((p) => p[index][1]);

  const cx = lerpMulti(progress, PHASE_BREAKPOINTS, xs);
  const cy = lerpMulti(progress, PHASE_BREAKPOINTS, ys);

  return <circle cx={cx} cy={cy} r={5} fill="rgba(255,255,255,0.7)" />;
}

/** Lines that connect dots — fade in during Community + Distribution phases. */
function MorphLines({ progress }: { progress: number }) {
  const lineOpacity = lerpMulti(progress, [0.5, 0.6, 0.8, 0.9], [0, 0.4, 0.4, 0.25]);

  const edges = useMemo(() => {
    const e: [number, number][] = [];
    for (let i = 0; i < DOT_COUNT; i++) {
      e.push([i, (i + 1) % DOT_COUNT]);
    }
    e.push([0, 5], [5, 10], [10, 15], [15, 0]);
    e.push([2, 7], [7, 12], [12, 17]);
    return e;
  }, []);

  return (
    <g style={{ opacity: lineOpacity }}>
      {edges.map(([a, b], i) => (
        <MorphLine key={i} a={a} b={b} progress={progress} />
      ))}
    </g>
  );
}

function MorphLine({
  a,
  b,
  progress,
}: {
  a: number;
  b: number;
  progress: number;
}) {
  const x1 = lerpMulti(progress, PHASE_BREAKPOINTS, PHASES.map((p) => p[a][0]));
  const y1 = lerpMulti(progress, PHASE_BREAKPOINTS, PHASES.map((p) => p[a][1]));
  const x2 = lerpMulti(progress, PHASE_BREAKPOINTS, PHASES.map((p) => p[b][0]));
  const y2 = lerpMulti(progress, PHASE_BREAKPOINTS, PHASES.map((p) => p[b][1]));

  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />;
}

/** Feature text panel — shows the content for the current phase. */
function FeaturePanel({
  phaseIndex,
  progress,
}: {
  phaseIndex: number;
  progress: number;
}) {
  const start = PHASE_BREAKPOINTS[phaseIndex];
  const end = PHASE_BREAKPOINTS[phaseIndex + 1];
  const mid = (start + end) / 2;

  const opacity = lerpMulti(progress, [start + 0.02, mid, end - 0.02], [0, 1, 0]);
  const y = lerpMulti(progress, [start, mid, end], [30, 0, -30]);

  if (opacity < 0.01) return null;

  const content = PHASE_CONTENT[phaseIndex];

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex flex-col justify-center"
    >
      <span className="text-xs font-medium uppercase tracking-[3px] text-muted-foreground">
        {content.label}
      </span>
      <h3 className="mt-4 text-2xl font-medium tracking-[-0.5px] md:text-4xl">
        {content.title}
      </h3>
      <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
        {content.description}
      </p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SECTION
// ─────────────────────────────────────────────────────────────────────────────

export function Solution() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const playKey = useKeyboardSound();
  const wasWriterPhase = useRef(false);

  // Native scroll listener + useState for progress (more reliable than
  // framer-motion's useScroll/useTransform with Lenis + sticky sections).
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

  // Play a keyboard tick when entering the Writer Tools phase (phase index 2).
  // Phase 2 spans progress [0.42, 0.64]; we trigger at ~0.48.
  useEffect(() => {
    const inWriter = progress > 0.46 && progress < 0.6;
    if (inWriter && !wasWriterPhase.current) {
      wasWriterPhase.current = true;
      playKey();
    } else if (!inWriter) {
      wasWriterPhase.current = false;
    }
  }, [progress, playKey]);

  return (
    <section
      ref={sectionRef}
      id="use-cases"
      className="relative border-t border-border/30 scroll-mt-20"
      style={{ height: "400vh" }}
    >
      {/* Sticky viewport — the morphing plays out here */}
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="grid w-full grid-cols-1 gap-8 px-6 md:grid-cols-2 md:gap-16 md:px-28">
          {/* LEFT — morphing SVG visualization */}
          <div className="flex items-center justify-center">
            <svg
              viewBox="-200 -150 400 300"
              className="h-[280px] w-full max-w-md md:h-[400px]"
              aria-hidden="true"
            >
              <MorphLines progress={progress} />
              {Array.from({ length: DOT_COUNT }).map((_, i) => (
                <MorphDot key={i} index={i} progress={progress} />
              ))}
            </svg>
          </div>

          {/* RIGHT — feature text, changes per phase */}
          <div className="relative h-[280px] md:h-[400px]">
            {PHASE_CONTENT.map((_, i) => (
              <FeaturePanel key={i} phaseIndex={i} progress={progress} />
            ))}
          </div>
        </div>
      </div>

      {/* Closing line after the sticky block releases */}
      <div className="flex min-h-screen items-center justify-center px-6">
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl text-center text-2xl font-medium tracking-[-0.5px] md:text-4xl"
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
