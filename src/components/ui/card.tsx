import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean; as?: "div" | "section" | "article" }>(
  function Card({ className, interactive, as: Tag = "div", ...props }, ref) {
    return (
      <Tag
        ref={ref}
        className={cn(
          "relative rounded-2xl border border-line bg-surface shadow-xs",
          interactive &&
            "transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md",
          className,
        )}
        {...props}
      />
    );
  },
);

export function CardHeader({
  title,
  description,
  action,
  className,
  titleId,
  icon,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  titleId?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-x-4 gap-y-3 px-5 pt-5", className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon}
        <div className="min-w-0">
          <h2 id={titleId} className="text-title font-semibold tracking-tight text-fg">
            {title}
          </h2>
          {description && <p className="mt-0.5 text-caption text-muted">{description}</p>}
        </div>
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}
