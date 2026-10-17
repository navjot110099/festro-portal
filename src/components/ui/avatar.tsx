import { cn } from "@/lib/utils";

const sizes = { xs: "size-6 text-[10px]", sm: "size-7 text-[11px]", md: "size-9 text-[12.5px]", lg: "size-11 text-sm", xl: "size-14 text-base" } as const;

/** Initials avatar with a stable, theme-aware tint derived from `hue`. */
export function Avatar({
  initials,
  hue = 348,
  size = "md",
  className,
  label,
}: {
  initials: string;
  hue?: number;
  size?: keyof typeof sizes;
  className?: string;
  label?: string;
}) {
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ "--h": hue } as React.CSSProperties}
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full font-semibold tracking-tight select-none",
        "bg-[hsl(var(--h)_42%_90%)] text-[hsl(var(--h)_45%_28%)] ring-2 ring-surface",
        "dark:bg-[hsl(var(--h)_28%_22%)] dark:text-[hsl(var(--h)_60%_82%)]",
        sizes[size],
        className,
      )}
    >
      {initials}
    </span>
  );
}

export function AvatarStack({ people, size = "xs", max = 3 }: { people: { initials: string; hue: number; name: string }[]; size?: keyof typeof sizes; max?: number }) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <span className="flex -space-x-1.5" aria-label={people.map((p) => p.name).join(", ")} role="img">
      {shown.map((p) => (
        <Avatar key={p.name} initials={p.initials} hue={p.hue} size={size} />
      ))}
      {rest > 0 && (
        <span className={cn("inline-grid place-items-center rounded-full bg-surface-3 font-medium text-muted ring-2 ring-surface", sizes[size])}>+{rest}</span>
      )}
    </span>
  );
}
