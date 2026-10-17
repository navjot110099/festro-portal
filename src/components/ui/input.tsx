import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-lg border border-line bg-surface text-[13.5px] text-fg shadow-xs transition-[border-color,box-shadow] duration-200 outline-none placeholder:text-subtle hover:border-line-strong focus-visible:border-accent/60 focus-visible:ring-4 focus-visible:ring-accent/12 focus-visible:outline-none disabled:opacity-60 aria-[invalid=true]:border-danger/60 aria-[invalid=true]:ring-danger/10";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  inputSize?: "sm" | "md" | "lg";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, leading, trailing, inputSize = "md", ...props },
  ref,
) {
  const h = inputSize === "lg" ? "h-11" : inputSize === "sm" ? "h-8" : "h-9";
  if (!leading && !trailing) {
    return <input ref={ref} className={cn(fieldBase, h, "px-3", className)} {...props} />;
  }
  return (
    <div className="relative w-full">
      {leading && (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-subtle [&_svg]:size-4">{leading}</span>
      )}
      <input ref={ref} className={cn(fieldBase, h, leading ? "pl-9" : "pl-3", trailing ? "pr-10" : "pr-3", className)} {...props} />
      {trailing && <span className="absolute inset-y-0 right-1.5 flex items-center">{trailing}</span>}
    </div>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...props },
  ref,
) {
  return <textarea ref={ref} className={cn(fieldBase, "min-h-24 px-3 py-2.5 leading-relaxed", className)} {...props} />;
});

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-[12.5px] font-medium text-fg-2", className)} {...props} />;
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
  aside,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={htmlFor}>{label}</Label>
        {aside}
      </div>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function NativeSelect({
  className,
  children,
  selectSize = "md",
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { selectSize?: "sm" | "md" }) {
  return (
    <div className={cn("relative", className)}>
      <select
        className={cn(
          fieldBase,
          selectSize === "sm" ? "h-8 text-[13px]" : "h-9",
          "cursor-pointer appearance-none bg-surface py-0 pr-8 pl-3",
        )}
        {...props}
      >
        {children}
      </select>
      <svg aria-hidden viewBox="0 0 16 16" className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-subtle">
        <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
