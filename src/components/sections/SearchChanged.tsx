import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { fadeUp } from "@/lib/animations";

const PLATFORMS = [
  {
    name: "ChatGPT",
    icon: "/assets/icon-chatgpt.png",
    description:
      "Conversational answers that synthesise sources, but rarely credit the writers behind them.",
    // Each icon gets a distinct parallax depth — far icons move slower,
    // near icons move faster, creating a sense of layered depth.
    parallax: 40,
  },
  {
    name: "Perplexity",
    icon: "/assets/icon-perplexity.png",
    description:
      "Real-time search with citations — useful for facts, not for following a writer's voice.",
    parallax: -20,
  },
  {
    name: "Google AI",
    icon: "/assets/icon-google.png",
    description:
      "AI overviews compress the open web into a single answer box, hollowing out the click.",
    parallax: 60,
  },
] as const;

/** Single platform card with parallax on the icon. */
function PlatformCard({
  platform,
  index,
  scrollProgress,
}: {
  platform: (typeof PLATFORMS)[number];
  index: number;
  scrollProgress: MotionValue<number>;
}) {
  // Icon translates Y across the section's scroll progress.
  // Negative parallax = icon moves up as user scrolls down (foreground feel).
  // Positive parallax = icon moves down (background feel).
  const y = useTransform(
    scrollProgress,
    [0, 1],
    [-platform.parallax, platform.parallax]
  );

  return (
    <motion.div
      key={platform.name}
      {...fadeUp(0.2 + index * 0.1)}
      className="flex flex-col items-center text-center"
    >
      <motion.img
        src={platform.icon}
        alt={`${platform.name} icon`}
        className="h-[200px] w-[200px] object-contain"
        width={200}
        height={200}
        style={{ y }}
        // Subtle will-change hint for smoother GPU compositing
        data-parallax
      />
      <h3 className="mt-6 text-base font-semibold">{platform.name}</h3>
      <p className="mt-3 max-w-xs text-sm text-muted-foreground">
        {platform.description}
      </p>
    </motion.div>
  );
}

export function SearchChanged() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    // Start tracking when the section's top hits the bottom of the viewport,
    // stop when the section's bottom hits the top.
    offset: ["start end", "end start"],
  });

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="px-6 pt-52 pb-6 md:pt-64 md:pb-9 scroll-mt-20"
    >
      {/* Heading */}
      <motion.h2
        {...fadeUp(0)}
        className="mx-auto max-w-5xl text-center text-5xl font-medium tracking-[-2px] md:text-7xl lg:text-8xl"
      >
        Search has <span className="font-serif font-normal italic">changed.</span>
        <br className="hidden md:block" /> Have you?
      </motion.h2>

      {/* Subtitle */}
      <motion.p
        {...fadeUp(0.1)}
        className="mx-auto mt-8 mb-24 max-w-2xl text-center text-lg text-muted-foreground"
      >
        The answers people used to discover through blogs, newsletters, and
        long-form writing are now surfaced — and often stripped of their
        authors — by AI platforms.
      </motion.p>

      {/* Platform cards with parallax icons */}
      <div className="mx-auto mb-20 grid max-w-6xl gap-12 md:grid-cols-3 md:gap-8">
        {PLATFORMS.map((platform, i) => (
          <PlatformCard
            key={platform.name}
            platform={platform}
            index={i}
            scrollProgress={scrollYProgress}
          />
        ))}
      </div>

      {/* Bottom tagline */}
      <motion.p
        {...fadeUp(0.5)}
        className="text-center text-sm text-muted-foreground"
      >
        If you don't answer the questions, someone else will.
      </motion.p>
    </section>
  );
}
