import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

const MISSION_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_132944_a0d124bb-eaa1-4082-aa30-2310efb42b4b.mp4";

const PARAGRAPH_1 =
  "We're building a space where curiosity meets clarity — where readers find depth, writers find reach, and every newsletter becomes a conversation worth having.";
const PARAGRAPH_1_HIGHLIGHTS = new Set(["curiosity", "meets", "clarity"]);

const PARAGRAPH_2 =
  "A platform where content, community, and insight flow together — with less noise, less friction, and more meaning for everyone involved.";

/** Strip surrounding punctuation so highlight lookups match bare words. */
function bare(token: string): string {
  return token.replace(/[^A-Za-z']/g, "");
}

interface WordProps {
  token: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
  range: [number, number];
  highlight?: boolean;
}

/** Single word whose opacity tracks a slice of the paragraph scroll range. */
function Word({ token, index, total, progress, range, highlight }: WordProps) {
  const [start, end] = range;
  const span = end - start;
  const wordStart = start + (span * index) / total;
  const wordEnd = start + (span * (index + 1)) / total;
  const opacity = useTransform(
    progress,
    [wordStart, (wordStart + wordEnd) / 2, wordEnd],
    [0.15, 1, 1]
  );
  return (
    <motion.span
      style={{ opacity }}
      className={highlight ? "text-foreground" : "text-[hsl(var(--hero-subtitle))]"}
    >
      {token}{" "}
    </motion.span>
  );
}

interface RevealParagraphProps {
  text: string;
  progress: MotionValue<number>;
  highlights?: Set<string>;
  className: string;
  range: [number, number];
}

function RevealParagraph({
  text,
  progress,
  highlights,
  className,
  range,
}: RevealParagraphProps) {
  const tokens = text.split(" ");
  return (
    <p className={className}>
      {tokens.map((token, i) => (
        <Word
          key={`${token}-${i}`}
          token={token}
          index={i}
          total={tokens.length}
          progress={progress}
          range={range}
          highlight={highlights?.has(bare(token))}
        />
      ))}
    </p>
  );
}

export function Mission() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.15"],
  });

  return (
    <section ref={ref} className="relative px-6 pt-0 pb-32 md:pb-44">
      {/* Large square video */}
      <div className="mx-auto mb-24 flex max-w-[800px] justify-center">
        <video
          className="h-auto w-full max-w-[800px] rounded-2xl object-cover"
          src={MISSION_VIDEO}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
      </div>

      {/* Scroll-driven reveal paragraphs */}
      <div className="mx-auto max-w-5xl text-center">
        <RevealParagraph
          text={PARAGRAPH_1}
          progress={scrollYProgress}
          highlights={PARAGRAPH_1_HIGHLIGHTS}
          range={[0.05, 0.55]}
          className="text-2xl font-medium tracking-[-1px] md:text-4xl lg:text-5xl"
        />
        <RevealParagraph
          text={PARAGRAPH_2}
          progress={scrollYProgress}
          range={[0.55, 0.95]}
          className="mt-10 text-xl font-medium tracking-[-0.5px] md:text-2xl lg:text-3xl"
        />
      </div>
    </section>
  );
}
