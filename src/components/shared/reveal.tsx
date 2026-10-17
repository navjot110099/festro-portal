import { cn } from "@/lib/utils";

/**
 * Staggered entrance for a group of cards. Pure CSS (see `.stagger` in globals.css),
 * so cards are visible as soon as they render, even before animation frames run.
 */
export function Stagger({ className, children, as = "div" }: { className?: string; children: React.ReactNode; as?: "div" | "ul" | "section" }) {
  const Comp = as;
  return <Comp className={cn("stagger", className)}>{children}</Comp>;
}

export function StaggerItem({ className, children, as = "div" }: { className?: string; children: React.ReactNode; as?: "div" | "li" }) {
  const Comp = as;
  return <Comp className={className}>{children}</Comp>;
}
