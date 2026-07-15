import { useRef, useCallback, useEffect } from "react";

/**
 * Synthesizes a soft keyboard "tick" sound using the Web Audio API.
 *
 * No external audio assets needed — the click is generated procedurally
 * from a short oscillator burst with a fast decay envelope. Designed to
 * be subtle (gain ~0.06) so it reads as a gentle keystroke, not a beep.
 *
 * Browsers block AudioContext until the user has interacted with the page.
 * We lazily create + resume the context on the first call to `play()`,
 * which by that point will always happen after a scroll/click (user gesture).
 */
export function useKeyboardSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {});
        ctxRef.current = null;
      }
    };
  }, []);

  const play = useCallback(() => {
    try {
      if (!ctxRef.current) {
        const AC =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (!AC) return;
        ctxRef.current = new AC();
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;

      // --- tick: short square-wave burst with exponential freq drop + fast decay
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.015);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Audio is non-critical — silently ignore any failure
    }
  }, []);

  return play;
}
