import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Checkbox = forwardRef<HTMLInputElement, Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">>(function Checkbox(
  { className, ...props },
  ref,
) {
  return (
    <span className={cn("relative inline-grid size-4 shrink-0 place-items-center", className)}>
      <input
        ref={ref}
        type="checkbox"
        className="peer size-4 cursor-pointer appearance-none rounded-[5px] border border-line-strong bg-surface shadow-xs transition-colors checked:border-brand checked:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        {...props}
      />
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="pointer-events-none absolute size-3 scale-75 text-brand-fg opacity-0 transition-all duration-150 peer-checked:scale-100 peer-checked:opacity-100"
      >
        <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
});
