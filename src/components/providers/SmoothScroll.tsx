import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Lenis smooth-scroll provider.
 *
 * Wraps the app to enable buttery-smooth scrolling that pairs naturally with
 * Framer Motion's scroll-driven animations. Respects prefers-reduced-motion:
 * if the user has reduced motion enabled, Lenis is not initialised and the
 * browser's native scrolling is used instead.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      // ease-out-expo — slow, deliberate finish
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Keep touch native — Lenis can feel laggy on mobile
      syncTouch: false,
      touchMultiplier: 1.5,
    });

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Anchor links: tell Lenis to handle internal #nav jumps smoothly
    function handleClick(event: MouseEvent) {
      const target = (event.target as HTMLElement)?.closest(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      if (!target) return;
      const id = target.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      event.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -80, duration: 1.4 });
    }
    document.addEventListener("click", handleClick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", handleClick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
