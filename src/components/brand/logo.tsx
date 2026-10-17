import { cn } from "@/lib/utils";

const sizes = {
  sm: "text-[17px]",
  md: "text-[20px]",
  lg: "text-[24px]",
} as const;

/** Festro wordmark: the name alone, set in the UI typeface. */
export function Logo({ className, tone = "default", size = "md" }: { className?: string; tone?: "default" | "light"; size?: keyof typeof sizes }) {
  return (
    <span className={cn("inline-block leading-none font-semibold tracking-[-0.045em] select-none", sizes[size], tone === "light" ? "text-ivory" : "text-fg", className)}>
      Festro
    </span>
  );
}

/** Compact form for tight spaces (collapsed sidebar): the initial, matching the wordmark. */
export function LogoMark({ className, tone = "default" }: { className?: string; tone?: "default" | "light" }) {
  return (
    <span
      aria-hidden
      className={cn("inline-grid size-9 place-items-center text-[22px] leading-none font-semibold tracking-[-0.04em] select-none", tone === "light" ? "text-ivory" : "text-fg", className)}
    >
      F
    </span>
  );
}
