import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_120549_0cd82c36-56b3-4dd9-b190-069cfc3a623f.mp4";

export function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Background video */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={HERO_VIDEO}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />

      {/* Bottom fade to black */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-28 md:pt-32 text-center">
        {/* Avatar row */}
        <motion.div
          {...fadeUp(0.1)}
          className="flex items-center gap-3"
        >
          <div className="flex -space-x-2">
            <img
              src="/assets/avatar-1.png"
              alt="Subscriber"
              className="h-8 w-8 rounded-full border-2 border-background object-cover"
              width={32}
              height={32}
            />
            <img
              src="/assets/avatar-2.png"
              alt="Subscriber"
              className="h-8 w-8 rounded-full border-2 border-background object-cover"
              width={32}
              height={32}
            />
            <img
              src="/assets/avatar-3.png"
              alt="Subscriber"
              className="h-8 w-8 rounded-full border-2 border-background object-cover"
              width={32}
              height={32}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            7,000+ people already subscribed
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          {...fadeUp(0.2)}
          className="mt-8 text-5xl font-medium tracking-[-2px] md:text-7xl lg:text-8xl"
        >
          Get <span className="font-serif font-normal italic">Inspired</span> with Us
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...fadeUp(0.3)}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-[hsl(var(--hero-subtitle))]"
        >
          Join our feed for meaningful updates, news around technology and a
          shared journey toward depth and direction.
        </motion.p>

        {/* Email form */}
        <motion.form
          {...fadeUp(0.4)}
          onSubmit={(e) => e.preventDefault()}
          className="liquid-glass mt-10 flex w-full max-w-lg items-center gap-2 rounded-full p-2"
        >
          <input
            type="email"
            required
            placeholder="Enter your email"
            aria-label="Email address"
            className="flex-1 bg-transparent px-5 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="rounded-full bg-foreground px-8 py-3 text-xs font-semibold tracking-[2px] text-background"
          >
            SUBSCRIBE
          </motion.button>
        </motion.form>
      </div>
    </section>
  );
}
