import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow && <div className="mb-2 flex items-center gap-2 text-caption font-medium text-muted">{eyebrow}</div>}
        <h1 className="text-[26px] leading-[1.15] font-semibold tracking-[-0.025em] text-fg sm:text-[28px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[14px] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function SectionTitle({ title, description, action, id }: { title: string; description?: string; action?: React.ReactNode; id?: string }) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 id={id} className="text-[15px] font-semibold tracking-tight text-fg">
          {title}
        </h2>
        {description && <p className="mt-0.5 text-caption text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
