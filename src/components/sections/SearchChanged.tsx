import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";

const PLATFORMS = [
  {
    name: "ChatGPT",
    icon: "/assets/icon-chatgpt.png",
    description:
      "Conversational answers that synthesise sources, but rarely credit the writers behind them.",
  },
  {
    name: "Perplexity",
    icon: "/assets/icon-perplexity.png",
    description:
      "Real-time search with citations — useful for facts, not for following a writer's voice.",
  },
  {
    name: "Google AI",
    icon: "/assets/icon-google.png",
    description:
      "AI overviews compress the open web into a single answer box, hollowing out the click.",
  },
] as const;

export function SearchChanged() {
  return (
    <section id="how-it-works" className="px-6 pt-52 pb-6 md:pt-64 md:pb-9 scroll-mt-20">
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

      {/* Platform cards */}
      <div className="mx-auto mb-20 grid max-w-6xl gap-12 md:grid-cols-3 md:gap-8">
        {PLATFORMS.map((platform, i) => (
          <motion.div
            key={platform.name}
            {...fadeUp(0.2 + i * 0.1)}
            className="flex flex-col items-center text-center"
          >
            <img
              src={platform.icon}
              alt={`${platform.name} icon`}
              className="h-[200px] w-[200px] object-contain"
              width={200}
              height={200}
            />
            <h3 className="mt-6 text-base font-semibold">{platform.name}</h3>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              {platform.description}
            </p>
          </motion.div>
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
