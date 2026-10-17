import { useId } from "react";
import { cn } from "@/lib/utils";

/** FadHype mark: an "F" whose arms rise like a growth line, ending in a data point. */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8 shrink-0", className)} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id={`${id}-g`} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#9a2e45" />
          <stop offset="0.55" stopColor="#541827" />
          <stop offset="1" stopColor="#2a0c14" />
        </linearGradient>
        <linearGradient id={`${id}-s`} x1="0" y1="0" x2="0" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${id}-g)`} />
      <rect x="0.5" y="0.5" width="31" height="31" rx="8.5" fill={`url(#${id}-s)`} stroke="#fff" strokeOpacity="0.12" />
      <path d="M11 23.5V10.4l9.6-2.6M11 16.6l6.4-1.7" fill="none" stroke="#F7F3ED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="23.4" cy="7.1" r="1.9" fill="#F7F3ED" />
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
  showWordmark = true,
  tone = "default",
}: {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
  tone?: "default" | "light";
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={markClassName} />
      {showWordmark && (
        <span className={cn("text-[17px] leading-none font-semibold tracking-[-0.035em]", tone === "light" ? "text-ivory" : "text-fg")}>
          Fad<span className={tone === "light" ? "text-[#e7b8c2]" : "text-accent"}>Hype</span>
        </span>
      )}
    </span>
  );
}
