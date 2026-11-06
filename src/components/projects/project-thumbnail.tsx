import { cn } from "@/lib/utils";
import type { Project } from "@/types";

/**
 * Generated project artwork: a stylised product frame per layout type.
 * Pure CSS (no image requests), so the portfolio stays fast and on-brand.
 */
export function ProjectThumbnail({ project, className, large }: { project: Project; className?: string; large?: boolean }) {
  const { hue, accentHue, layout } = project.visual;
  const bg = `linear-gradient(140deg, hsl(${hue} 38% 20%) 0%, hsl(${hue} 42% 13%) 55%, hsl(${accentHue} 40% 18%) 100%)`;
  const accent = `hsl(${accentHue} 70% 72%)`;
  const line = "rgb(247 243 237 / 0.16)";
  const strong = "rgb(247 243 237 / 0.85)";

  return (
    <div
      role="img"
      aria-label={`Artwork preview for the ${project.name} ${project.industry.toLowerCase()} project`}
      className={cn("noise relative isolate overflow-hidden", large ? "aspect-[16/8]" : "aspect-[16/10]", className)}
      style={{ background: bg }}
    >
      <div className="absolute -top-1/3 -right-1/4 size-[80%] rounded-full opacity-50 blur-3xl" style={{ background: `radial-gradient(circle, hsl(${accentHue} 70% 50% / 0.45), transparent 65%)` }} aria-hidden />
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{ backgroundImage: `linear-gradient(to right, ${strong} 1px, transparent 1px), linear-gradient(to bottom, ${strong} 1px, transparent 1px)`, backgroundSize: "28px 28px" }}
        aria-hidden
      />

      {/* Browser frame */}
      <div
        className="absolute inset-x-[9%] top-[14%] bottom-[-8%] overflow-hidden rounded-t-xl border border-white/10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)] transition-transform duration-700 ease-out group-hover:-translate-y-1.5"
        style={{ background: "rgb(20 12 15 / 0.55)", backdropFilter: "blur(6px)" }}
        aria-hidden
      >
        <div className="flex items-center gap-1 border-b border-white/10 px-3 py-2">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-1.5 rounded-full" style={{ background: line }} />
          ))}
          <span className="ml-3 h-1.5 w-1/3 rounded-full" style={{ background: line }} />
        </div>
        <div className="p-[5%]">
          {layout === "store" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="h-2 w-1/4 rounded-full" style={{ background: strong }} />
                <span className="h-4 w-14 rounded-full" style={{ background: accent }} />
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="aspect-[4/5] rounded-md" style={{ background: `linear-gradient(160deg, hsl(${hue + i * 18} 30% 40% / 0.6), hsl(${accentHue} 40% 30% / 0.4))` }} />
                    <span className="block h-1.5 w-3/4 rounded-full" style={{ background: line }} />
                    <span className="block h-1.5 w-1/3 rounded-full" style={{ background: accent, opacity: 0.8 }} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {layout === "dashboard" && (
            <div className="grid grid-cols-[22%_1fr] gap-3">
              <div className="space-y-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} className="block h-1.5 rounded-full" style={{ background: i === 1 ? accent : line, width: `${90 - i * 8}%` }} />
                ))}
              </div>
              <div className="space-y-2.5">
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="rounded-md border border-white/10 p-1.5">
                      <span className="block h-1 w-1/2 rounded-full" style={{ background: line }} />
                      <span className="mt-1.5 block h-2 w-3/4 rounded-full" style={{ background: strong }} />
                    </div>
                  ))}
                </div>
                <svg viewBox="0 0 200 60" className="w-full">
                  <path d="M0 52 C 30 48, 50 40, 75 38 S 120 22, 145 18 S 185 6, 200 4" fill="none" stroke={accent} strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M0 52 C 30 48, 50 40, 75 38 S 120 22, 145 18 S 185 6, 200 4 L200 60 L0 60Z" fill={accent} opacity="0.12" />
                </svg>
              </div>
            </div>
          )}
          {layout === "editorial" && (
            <div className="grid grid-cols-[1.1fr_1fr] gap-4">
              <div className="space-y-2 pt-2">
                <span className="block h-1.5 w-1/3 rounded-full" style={{ background: accent }} />
                <span className="block h-3 w-full rounded-full" style={{ background: strong }} />
                <span className="block h-3 w-4/5 rounded-full" style={{ background: strong }} />
                <span className="block h-1.5 w-full rounded-full" style={{ background: line }} />
                <span className="block h-1.5 w-11/12 rounded-full" style={{ background: line }} />
                <span className="mt-3 block h-4 w-20 rounded-full border" style={{ borderColor: accent }} />
              </div>
              <div className="aspect-[4/5] rounded-lg" style={{ background: `radial-gradient(circle at 30% 30%, hsl(${accentHue} 60% 60% / 0.7), hsl(${hue} 40% 25% / 0.6))` }} />
            </div>
          )}
          {layout === "app" && (
            <div className="flex items-start justify-center gap-4">
              {[0, 1].map((i) => (
                <div key={i} className={cn("w-[34%] rounded-[14px] border border-white/15 p-2", i === 1 && "mt-5")} style={{ background: "rgb(20 12 15 / 0.6)" }}>
                  <span className="mx-auto block h-1 w-1/3 rounded-full" style={{ background: line }} />
                  <span className="mt-3 block h-2 w-2/3 rounded-full" style={{ background: strong }} />
                  <div className="mt-2.5 aspect-square rounded-lg" style={{ background: `conic-gradient(from 200deg, ${accent} 0 68%, ${line} 68% 100%)`, maskImage: "radial-gradient(circle, transparent 46%, black 47%)" }} />
                  <span className="mt-2.5 block h-1.5 w-full rounded-full" style={{ background: line }} />
                  <span className="mt-1.5 block h-1.5 w-3/4 rounded-full" style={{ background: line }} />
                </div>
              ))}
            </div>
          )}
          {layout === "landing" && (
            <div className="flex flex-col items-center pt-2 text-center">
              <span className="h-1.5 w-20 rounded-full" style={{ background: accent }} />
              <span className="mt-3 h-3.5 w-3/4 rounded-full" style={{ background: strong }} />
              <span className="mt-2 h-3.5 w-1/2 rounded-full" style={{ background: strong }} />
              <span className="mt-3 h-1.5 w-2/3 rounded-full" style={{ background: line }} />
              <div className="mt-4 flex gap-2">
                <span className="h-5 w-20 rounded-full" style={{ background: accent }} />
                <span className="h-5 w-16 rounded-full border border-white/20" />
              </div>
              <div className="mt-4 grid w-full grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className="h-8 rounded-md border border-white/10" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
