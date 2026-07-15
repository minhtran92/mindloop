import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Hls from "hls.js";
import { Logo } from "@/components/icons/Logo";
import { fadeUp } from "@/lib/animations";

const HLS_URL =
  "https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8";

export function CTA() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Track scroll progress through the CTA section.
  // Used to subtly amplify the buttons as the user reaches the bottom —
  // a quiet, non-aggressive nudge toward action.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end center"],
  });

  // Primary button: 1.0 → 1.04 scale across the section.
  const primaryScale = useTransform(scrollYProgress, [0, 1], [1, 1.04]);
  // Secondary (Start Writing): subtle border brighten — 20% → 60% opacity.
  const secondaryBorder = useTransform(
    scrollYProgress,
    [0, 1],
    ["rgba(255,255,255,0.2)", "rgba(255,255,255,0.6)"]
  );
  const secondaryGlow = useTransform(
    scrollYProgress,
    [0, 1],
    ["0 0 0px rgba(255,255,255,0)", "0 0 24px rgba(255,255,255,0.08)"]
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });

      // Graceful error recovery — if the stream fatally fails, destroy Hls
      // and fall back to a static black background (the overlay already
      // darkens whatever is underneath, so this is visually seamless).
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls?.recoverMediaError();
              break;
            default:
              hls?.destroy();
              break;
          }
        }
      });

      hls.loadSource(HLS_URL);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS (Safari)
      video.src = HLS_URL;
    }

    // Try to play — browsers may block until user interacts, that's fine.
    video.play().catch(() => {
      /* autoplay may be blocked; the muted attribute should let it through */
    });

    return () => {
      if (hls) hls.destroy();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-t border-border/30 px-6 py-32 md:py-44"
    >
      {/* Background HLS video */}
      <video
        ref={videoRef}
        className="absolute inset-0 z-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 z-[1] bg-background/45" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        <motion.div {...fadeUp(0)} className="mb-8">
          <Logo size={40} />
        </motion.div>

        <motion.h2
          {...fadeUp(0.1)}
          className="text-4xl font-medium tracking-[-1px] md:text-6xl"
        >
          Start Your <span className="font-serif font-normal italic">Journey</span>
        </motion.h2>

        <motion.p
          {...fadeUp(0.2)}
          className="mt-6 max-w-xl text-lg text-muted-foreground"
        >
          Subscribe to receive our next issue, or start writing your own — Mindloop
          gives you the room to think out loud, with the audience to match.
        </motion.p>

        <motion.div
          {...fadeUp(0.3)}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <motion.button
            style={{ scale: primaryScale }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="rounded-lg bg-foreground px-8 py-3.5 text-sm font-semibold text-background"
          >
            Subscribe Now
          </motion.button>
          <motion.button
            style={{
              borderColor: secondaryBorder,
              boxShadow: secondaryGlow,
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="liquid-glass rounded-lg border px-8 py-3.5 text-sm font-semibold text-foreground"
          >
            Start Writing
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
