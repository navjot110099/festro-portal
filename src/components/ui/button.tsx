import { Slot } from "radix-ui";
import { LoaderCircle } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-brand text-brand-fg shadow-brand hover:bg-brand-hover disabled:bg-brand/60 [&_svg]:text-brand-fg/90",
  secondary:
    "border border-line bg-surface text-fg shadow-xs hover:border-line-strong hover:bg-surface-2",
  ghost: "text-fg-2 hover:bg-surface-2 hover:text-fg",
  soft: "bg-accent-soft text-accent-ink hover:bg-accent-soft-2",
  outline: "border border-line-strong text-fg hover:bg-surface-2",
  danger: "bg-danger text-white hover:opacity-90",
  link: "h-auto px-0 text-accent-ink underline-offset-4 hover:underline",
} as const;

const sizes = {
  xs: "h-7 gap-1.5 rounded-md px-2.5 text-xs",
  sm: "h-8 gap-1.5 rounded-lg px-3 text-[13px]",
  md: "h-9 gap-2 rounded-lg px-3.5 text-[13.5px]",
  lg: "h-11 gap-2 rounded-xl px-5 text-sm",
  icon: "size-9 rounded-lg",
  "icon-sm": "size-8 rounded-lg",
  "icon-xs": "size-7 rounded-md",
} as const;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  asChild?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", asChild, loading, disabled, children, type, ...props },
  ref,
) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : (type ?? "button")}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap select-none",
        "transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-200 ease-out",
        "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <>
          <span className="invisible inline-flex items-center gap-2">{children}</span>
          <span className="absolute inset-0 grid place-items-center">
            <LoaderCircle className="animate-spin" aria-hidden />
          </span>
        </>
      ) : (
        children
      )}
    </Comp>
  );
});
