"use client";

import { Tooltip as TooltipPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

export function Tooltip({
  content,
  children,
  side = "top",
  align = "center",
  disabled,
  className,
  sideOffset = 8,
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  disabled?: boolean;
  className?: string;
  sideOffset?: number;
}) {
  if (disabled) return <>{children}</>;
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          align={align}
          sideOffset={sideOffset}
          className={cn(
            "z-[95] max-w-64 rounded-lg bg-charcoal px-2.5 py-1.5 text-[12px] font-medium text-ivory shadow-lg dark:border dark:border-line dark:bg-surface-3 dark:text-fg",
            "origin-[var(--radix-tooltip-content-transform-origin)] animate-in",
            className,
          )}
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
