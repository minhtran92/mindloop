import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { fadeUp } from "@/lib/animations";

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

/** A single platform icon that converges toward center as the user scrolls. */
function MergingIcon({
  platform,
  progress,
}: {
  platform: (typeof PLATFORMS)[number];
  progress: MotionValue<number>;
}) {
  // Phase mapping:
  //   0.00 - 0.15  →  icons sit in starting positions (spread)
  //   0.15 - 0.55  →  icons converge toward center (0,0)
  //   0.55 - 0.72  →  icons shrink + fade into the dark circle
  //   0.72 - 1.00  →  icons gone; dark circle + question hold
  const x = useTransform(
    progress,
    [0, 0.15, 0.55, 0.72],
    [platform.startX, platform.startX, 0, 0]
  );
  const y = useTransform(
    progress,
    [0, 0.15, 0.55, 0.72],
    [platform.startY, platform.startY, 0, 0]
  );
  const scale = useTransform(
    progress,
    [0, 0.15, 0.55, 0.72],
    [1, 1, 0.35, 0.15]
  );
  const opacity = useTransform(
    progress,
    [0, 0.15, 0.5, 0.68],
    [1, 1, 0.8, 0]
  );

  return (
    <motion.img
      src={platform.icon}
      alt={`${platform.name} icon`}
      className="absolute h-[120px] w-[120px] object-contain md:h-[160px] md:w-[160px]"
      width={160}
      height={160}
      style={{ x, y, scale, opacity }}
    />
  );
}

export function SearchChanged() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // The dark circle (the "black hole") emerges as icons merge
  const circleScale = useTransform(
    scrollYProgress,
    [0.4, 0.65, 0.8],
    [0.3, 1, 1.1]
  );
  const circleOpacity = useTransform(
    scrollYProgress,
    [0.4, 0.6, 0.72],
    [0, 0.85, 1]
  );
  // Inner glow pulse after formation
  const circleGlow = useTransform(
    scrollYProgress,
    [0.65, 0.85],
    [0, 0.4]
  );

  // Question text — the emotional climax of this section
  const questionOpacity = useTransform(
    scrollYProgress,
    [0.78, 0.88, 0.97],
    [0, 1, 1]
  );
  const questionY = useTransform(
    scrollYProgress,
    [0.78, 0.88],
    [30, 0]
  );

  // Labels under icons — fade out as merge begins
  const labelsOpacity = useTransform(
    scrollYProgress,
    [0, 0.1, 0.2],
    [1, 1, 0]
  );

  // Heading + subtitle fade out as merge zone takes over
  const headingOpacity = useTransform(
    scrollYProgress,
    [0, 0.05, 0.12],
    [1, 1, 0]
  );

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative scroll-mt-20"
      // Tall section — gives enough scroll distance for the merge narrative
      style={{ height: "320vh" }}
    >
      {/* Sticky viewport — the merge plays out here, pinned while user scrolls */}
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* Heading + subtitle — top of the sticky zone, fades as merge begins */}
        <motion.div
          style={{ opacity: headingOpacity }}
          className="absolute top-28 left-0 right-0 px-6 text-center md:top-32"
        >
          <motion.h2
            {...fadeUp(0)}
            className="mx-auto max-w-5xl text-5xl font-medium tracking-[-2px] md:text-7xl lg:text-8xl"
          >
            Search has{" "}
            <span className="font-serif font-normal italic">changed.</span>
            <br className="hidden md:block" /> Have you?
          </motion.h2>
          <motion.p
            {...fadeUp(0.1)}
            className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground"
          >
            Three platforms now mediate what the world reads. Watch what
            happens when they converge.
          </motion.p>
        </motion.div>

        {/* Icon cluster — relative container for merging icons */}
        <div className="relative flex items-center justify-center">
          {/* The dark circle — "the black hole" that swallows the icons */}
          <motion.div
            style={{
              scale: circleScale,
              opacity: circleOpacity,
              boxShadow: useTransform(
                circleGlow,
                (v) => `0 0 ${80 * v}px ${20 * v}px rgba(0,0,0,${0.6 * v})`
              ),
            }}
            className="absolute h-48 w-48 rounded-full bg-foreground md:h-64 md:w-64"
          />

          {/* Platform labels — fade out as merge begins */}
          <motion.div
            style={{ opacity: labelsOpacity }}
            className="absolute -bottom-40 flex gap-12 md:gap-20"
          >
            {PLATFORMS.map((p) => (
              <div key={p.name} className="w-[120px] text-center md:w-[160px]">
                <p className="text-sm font-semibold text-foreground">{p.name}</p>
              </div>
            ))}
          </motion.div>

          {/* The three merging icons */}
          {PLATFORMS.map((platform) => (
            <MergingIcon
              key={platform.name}
              platform={platform}
              progress={scrollYProgress}
            />
          ))}
        </div>

        {/* The question — appears after the merge */}
        <motion.div
          style={{ opacity: questionOpacity, y: questionY }}
          className="absolute bottom-32 left-0 right-0 px-6 text-center md:bottom-40"
        >
          <p className="mx-auto max-w-2xl text-2xl font-medium tracking-[-0.5px] text-foreground md:text-4xl">
            Where is{" "}
            <span className="font-serif font-normal italic">your voice</span>{" "}
            in this crowd?
          </p>
          <p className="mt-4 text-sm text-muted-foreground md:text-base">
            If you don&rsquo;t answer the questions, someone else will.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
