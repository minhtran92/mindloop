import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { fadeUp } from "@/lib/animations";

const SOLUTION_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_125119_8e5ae31c-0021-4396-bc08-f7aebeb877a2.mp4";

const FEATURES = [
  {
    title: "Curated Feed",
    description:
      "A personalised stream of newsletters ranked by depth, not engagement — tuned to what you actually want to read.",
  },
  {
    title: "Writer Tools",
    description:
      "A focused editor with analytics, audience insights, and AI assist that respects your voice instead of replacing it.",
  },
  {
    title: "Community",
    description:
      "Threaded conversations inside every issue, so readers and writers meet where the thinking actually happens.",
  },
  {
    title: "Distribution",
    description:
      "Cross-publish to email, web, RSS, and AI search with one click — your work stays portable and credited.",
  },
] as const;

export function Solution() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    // Begin revealing as the section enters, finish when it leaves.
    offset: ["start start", "end end"],
  });

  return (
    <section
      ref={sectionRef}
      id="use-cases"
      className="border-t border-border/30 scroll-mt-20"
    >
      {/* Top intro block — label + heading + video. Fades in normally. */}
      <div className="px-6 pt-32 md:pt-44">
        <motion.span
          {...fadeUp(0)}
          className="block text-center text-xs font-medium uppercase tracking-[3px] text-muted-foreground"
        >
          SOLUTION
        </motion.span>

        <motion.h2
          {...fadeUp(0.1)}
          className="mx-auto mt-6 max-w-4xl text-center text-4xl font-medium tracking-[-1px] md:text-6xl"
        >
          The platform for{" "}
          <span className="font-serif font-normal italic">meaningful</span> content
        </motion.h2>

        <motion.div {...fadeUp(0.2)} className="mx-auto mt-16 max-w-6xl">
          <video
            className="aspect-[3/1] w-full rounded-2xl object-cover"
            src={SOLUTION_VIDEO}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          />
        </motion.div>
      </div>

      {/* Sticky storytelling block.
          Layout: 2 columns on desktop.
            - Left: heading + subtitle, pinned while the right column scrolls.
            - Right: each feature reveals sequentially as the user scrolls.
          Section height = top padding + N features × feature row height +
          bottom padding, giving enough scroll distance for the sequential
          reveal to feel deliberate. */}
      <div className="px-6 md:px-28">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          {/* LEFT — sticky on md+ */}
          <div className="md:sticky md:top-32 md:self-start md:h-fit">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-3xl font-medium tracking-[-0.5px] md:text-4xl"
            >
              Built for the people who{" "}
              <span className="font-serif font-normal italic">think</span> in
              long form.
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
              className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground"
            >
              Four pillars hold Mindloop up. Scroll through each — they{"'"}re
              designed to fit together, not to be picked apart.
            </motion.p>
          </div>

          {/* RIGHT — sequential reveal. Each feature gets its own scroll slice. */}
          <div className="flex flex-col">
            {FEATURES.map((feature, i) => {
              // Each feature occupies a slice of the scroll range.
              const slice = 1 / FEATURES.length;
              const start = i * slice;
              const end = start + slice;
              // Opacity ramps up at the start of the slice and holds,
              // then ramps down just before the next feature takes over.
              const fadeStart = start;
              const fadePeak = start + slice * 0.3;
              const fadeHold = end - slice * 0.3;
              const fadeEnd = end;

              const opacity = useTransform(
                scrollYProgress,
                [fadeStart, fadePeak, fadeHold, fadeEnd],
                [0.15, 1, 1, 0.15]
              );
              const y = useTransform(
                scrollYProgress,
                [fadeStart, fadePeak, fadeHold, fadeEnd],
                [30, 0, 0, -30]
              );

              return (
                <motion.div
                  key={feature.title}
                  style={{ opacity, y }}
                  className="border-t border-border/40 py-12 first:border-t-0 first:pt-0 md:py-16"
                >
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-xs text-muted-foreground/60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h4 className="text-2xl font-semibold tracking-[-0.3px] md:text-3xl">
                      {feature.title}
                    </h4>
                  </div>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Closing line, fades in after the sticky block releases. */}
      <motion.p
        {...fadeUp(0)}
        className="mx-auto mt-24 max-w-2xl px-6 pb-32 text-center text-lg text-muted-foreground md:mt-32 md:pb-44"
      >
        Less noise, less friction — more{" "}
        <span className="font-serif font-normal italic text-foreground">
          meaning
        </span>{" "}
        for everyone involved.
      </motion.p>
    </section>
  );
}
