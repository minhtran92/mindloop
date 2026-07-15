import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** outer circle size in px (the inner is auto-scaled to ~43% of this) */
  size?: number;
}

/**
 * Mindloop concentric circles logo.
 * Pure CSS — outer ring with border-2 border-foreground/60,
 * inner ring with border border-foreground/60.
 */
export function Logo({ className, size = 28 }: LogoProps) {
  return (
    <span
      className={cn("relative inline-block", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span
        className="absolute inset-0 rounded-full border-2 border-foreground/60"
      />
      <span
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/60"
        style={{ width: size * 0.43, height: size * 0.43 }}
      />
    </span>
  );
}
