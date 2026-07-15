import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Hls from "hls.js";
import { Logo } from "@/components/icons/Logo";
import { fadeUp } from "@/lib/animations";
import { useKeyboardSound } from "@/hooks/useKeyboardSound";

const HLS_URL =
  "https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8";

/**
 * The "waiting to type" prompt that cycles through placeholder phrases.
 * Gives the Start Writing button the feel of an editor that's already open,
 * cursor blinking, waiting for the user's first sentence.
 */
const PROMPTS = [
  "The first sentence doesn't have to be perfect…",
  "Start with what you noticed today…",
  "Write the thing you've been avoiding…",
  "Begin with a question, not an answer…",
];

export function CTA() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [promptIndex, setPromptIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const playKey = useKeyboardSound();

  // Track scroll progress through the CTA section.
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

  // The "waiting to type" text field fades in as the CTA enters view
  const fieldOpacity = useTransform(scrollYProgress, [0.3, 0.6], [0, 1]);
  const fieldY = useTransform(scrollYProgress, [0.3, 0.6], [20, 0]);

  // HLS setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });

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
      video.src = HLS_URL;
    }

    video.play().catch(() => {});

    return () => {
      if (hls) hls.destroy();
    };
  }, []);

  // Typewriter effect — cycles through placeholder prompts, typing and
  // erasing each one. Plays a soft keyboard tick on each character.
  useEffect(() => {
    const current = PROMPTS[promptIndex];
    let charIndex = 0;
    let phase: "typing" | "holding" | "erasing" = "typing";
    let timeoutId: ReturnType<typeof setTimeout>;

    function tick() {
      if (phase === "typing") {
        if (charIndex <= current.length) {
          setTyped(current.slice(0, charIndex));
          if (charIndex > 0 && charIndex % 2 === 0) playKey();
          charIndex++;
          timeoutId = setTimeout(tick, 45 + Math.random() * 40);
        } else {
          phase = "holding";
          timeoutId = setTimeout(tick, 2500);
        }
      } else if (phase === "holding") {
        phase = "erasing";
        timeoutId = setTimeout(tick, 30);
      } else {
        if (charIndex > 0) {
          charIndex--;
          setTyped(current.slice(0, charIndex));
          timeoutId = setTimeout(tick, 25);
        } else {
          setPromptIndex((i) => (i + 1) % PROMPTS.length);
        }
      }
    }

    timeoutId = setTimeout(tick, 500);
    return () => clearTimeout(timeoutId);
  }, [promptIndex, playKey]);

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

        {/* "Waiting to type" text field — appears as user scrolls into CTA.
            Looks like an editor that's already open, cursor blinking. */}
        <motion.div
          style={{ opacity: fieldOpacity, y: fieldY }}
          className="liquid-glass mt-10 flex w-full max-w-lg items-center rounded-lg px-5 py-4 text-left"
        >
          <span className="font-mono text-sm text-muted-foreground">
            {typed}
            <span className="ml-0.5 inline-block w-[2px] animate-pulse bg-foreground align-middle" style={{ height: "1em" }} />
          </span>
        </motion.div>

        <motion.div
          {...fadeUp(0.3)}
          className="mt-6 flex flex-col gap-4 sm:flex-row"
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
            {/* Blinking underscore — terminal-style "waiting for input" */}
            <span className="ml-1 inline-block w-[8px] -translate-y-[1px] animate-pulse text-foreground">
              _
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
