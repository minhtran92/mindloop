import { useEffect, useRef, useState } from "react";

const PLATFORMS = [
  {
    name: "ChatGPT",
    icon: "/assets/icon-chatgpt.png",
    description:
      "Conversational answers that synthesise sources, but rarely credit the writers behind them.",
    // Starting offset from center (in px) — spread in a row
    startX: -180,
    startY: 0,
  },
  {
    name: "Perplexity",
    icon: "/assets/icon-perplexity.png",
    description:
      "Real-time search with citations — useful for facts, not for following a writer's voice.",
    startX: 0,
    startY: -10,
  },
  {
    name: "Google AI",
    icon: "/assets/icon-google.png",
    description:
      "AI overviews compress the open web into a single answer box, hollowing out the click.",
    startX: 180,
    startY: 10,
  },
] as const;

// Linear interpolation between breakpoints.
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

/** A single platform icon that converges toward center as the user scrolls. */
function MergingIcon({
  platform,
  progress,
}: {
  platform: (typeof PLATFORMS)[number];
  progress: number;
}) {
  // Phase mapping:
  //   0.00 - 0.15  →  icons sit in starting positions (spread)
  //   0.15 - 0.55  →  icons converge toward center (0,0)
  //   0.55 - 0.72  →  icons shrink + fade into the dark circle
  //   0.72 - 1.00  →  icons gone; dark circle + question hold
  const x = lerpMulti(progress, [0, 0.15, 0.55, 0.72], [platform.startX, platform.startX, 0, 0]);
  const y = lerpMulti(progress, [0, 0.15, 0.55, 0.72], [platform.startY, platform.startY, 0, 0]);
  const scale = lerpMulti(progress, [0, 0.15, 0.55, 0.72], [1, 1, 0.35, 0.15]);
  const opacity = lerpMulti(progress, [0, 0.15, 0.5, 0.68], [1, 1, 0.8, 0]);

  if (opacity < 0.01) return null;

  return (
    <img
      src={platform.icon}
      alt={`${platform.name} icon`}
      className="absolute h-[120px] w-[120px] object-contain md:h-[160px] md:w-[160px]"
      width={160}
      height={160}
      style={{
        transform: `translate(${x}px, ${y}px) scale(${scale})`,
        opacity,
      }}
    />
  );
}

export function SearchChanged() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

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

  // The dark circle (the "black hole") emerges as icons merge
  const circleScale = lerpMulti(progress, [0.4, 0.65, 0.8], [0.3, 1, 1.1]);
  const circleOpacity = lerpMulti(progress, [0.4, 0.6, 0.72], [0, 0.85, 1]);
  const circleGlow = lerpMulti(progress, [0.65, 0.85], [0, 0.4]);
  const circleBoxShadow = `0 0 ${80 * circleGlow}px ${20 * circleGlow}px rgba(0,0,0,${0.6 * circleGlow})`;

  // Question text — the emotional climax of this section
  const questionOpacity = lerpMulti(progress, [0.78, 0.88, 0.97], [0, 1, 1]);
  const questionY = lerpMulti(progress, [0.78, 0.88], [30, 0]);

  // Labels under icons — fade out as merge begins
  const labelsOpacity = lerpMulti(progress, [0, 0.1, 0.2], [1, 1, 0]);

  // Heading + subtitle fade out FAST — gone before the circle emerges,
  // so they never overlap. Heading fades 0→0.25, circle emerges 0.4→0.6.
  const headingOpacity = lerpMulti(progress, [0, 0.1, 0.25], [1, 1, 0]);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative scroll-mt-20"
      // Tall section — gives enough scroll distance for the merge narrative.
      // scroll-snap-type: proximity lets the browser pause near the merge
      // moment without forcing a hard stop.
      style={{ height: "320vh", scrollSnapType: "y proximity" }}
    >
      {/* Sticky viewport — the merge plays out here, pinned while user scrolls.
          scroll-snap-align: start makes this viewport a snap target so the
          browser pauses here on proximity. */}
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden" style={{ scrollSnapAlign: "start", scrollSnapStop: "always" }}>
        {/* Icon cluster — relative container for merging icons + dark circle.
            z-0: sits at the back. Heading + question paint above it. */}
        <div className="relative z-0 flex items-center justify-center">
          {/* The dark circle — "the black hole" that swallows the icons */}
          {circleOpacity > 0.01 && (
            <div
              className="absolute h-48 w-48 rounded-full bg-foreground md:h-64 md:w-64"
              style={{
                transform: `scale(${circleScale})`,
                opacity: circleOpacity,
                boxShadow: circleBoxShadow,
              }}
            />
          )}

          {/* Platform labels — fade out as merge begins */}
          {labelsOpacity > 0.01 && (
            <div
              className="absolute -bottom-40 flex gap-12 md:gap-20"
              style={{ opacity: labelsOpacity }}
            >
              {PLATFORMS.map((p) => (
                <div key={p.name} className="w-[120px] text-center md:w-[160px]">
                  <p className="text-sm font-semibold text-foreground">{p.name}</p>
                </div>
              ))}
            </div>
          )}

          {/* The three merging icons */}
          {PLATFORMS.map((platform) => (
            <MergingIcon
              key={platform.name}
              platform={platform}
              progress={progress}
            />
          ))}
        </div>

        {/* Heading + subtitle — z-10, paints ABOVE the circle.
            Heading fades out (0→0.25) BEFORE the circle emerges (0.4→0.6),
            so they never overlap. */}
        {headingOpacity > 0.01 && (
          <div
            className="absolute top-28 left-0 right-0 z-10 px-6 text-center md:top-32"
            style={{ opacity: headingOpacity }}
          >
            <h2 className="mx-auto max-w-5xl text-6xl font-medium tracking-[-2px] md:text-8xl lg:text-9xl">
              Search has{" "}
              <span className="font-serif font-normal italic">changed.</span>
              <br className="hidden md:block" /> Have you?
            </h2>
            <p className="mx-auto mt-10 max-w-2xl text-2xl text-muted-foreground md:text-3xl">
              Three platforms now mediate what the world reads. Watch what
              happens when they converge.
            </p>
          </div>
        )}

        {/* The question — z-10, appears after the merge, paints above circle */}
        {questionOpacity > 0.01 && (
          <div
            className="absolute bottom-32 left-0 right-0 z-10 px-6 text-center md:bottom-40"
            style={{ opacity: questionOpacity, transform: `translateY(${questionY}px)` }}
          >
            <p className="mx-auto max-w-3xl text-4xl font-medium tracking-[-0.5px] text-foreground md:text-6xl lg:text-7xl">
              Where is{" "}
              <span className="font-serif font-normal italic">your voice</span>{" "}
              in this crowd?
            </p>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              If you don&rsquo;t answer the questions, someone else will.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
