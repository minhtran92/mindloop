import { motion } from "framer-motion";
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
  return (
    <section className="border-t border-border/30 px-6 py-32 md:py-44">
      {/* Label */}
      <motion.span
        {...fadeUp(0)}
        className="block text-center text-xs font-medium uppercase tracking-[3px] text-muted-foreground"
      >
        SOLUTION
      </motion.span>

      {/* Heading */}
      <motion.h2
        {...fadeUp(0.1)}
        className="mx-auto mt-6 max-w-4xl text-center text-4xl font-medium tracking-[-1px] md:text-6xl"
      >
        The platform for{" "}
        <span className="font-serif font-normal italic">meaningful</span> content
      </motion.h2>

      {/* Video */}
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

      {/* Feature grid */}
      <div className="mx-auto mt-20 grid max-w-6xl gap-8 md:grid-cols-4">
        {FEATURES.map((feature, i) => (
          <motion.div key={feature.title} {...fadeUp(0.3 + i * 0.1)}>
            <h3 className="text-base font-semibold">{feature.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
