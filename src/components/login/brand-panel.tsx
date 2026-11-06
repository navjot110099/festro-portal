"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/logo";

const capabilities = ["Web development", "SEO & GEO", "Paid media", "Lead generation", "AI automation", "E-commerce"];

const ease = [0.16, 1, 0.3, 1] as const;

/** Animated background: drifting wine light, a masked grid and slow growth curves. */
function Atmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -top-40 -right-32 size-[620px] rounded-full bg-[radial-gradient(circle,rgba(160,48,74,0.55)_0%,rgba(84,24,39,0)_65%)] blur-2xl animate-drift" />
      <div className="absolute -bottom-56 -left-40 size-[680px] rounded-full bg-[radial-gradient(circle,rgba(110,32,52,0.5)_0%,rgba(53,16,25,0)_65%)] blur-2xl animate-drift-slow" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "linear-gradient(to right, #f7f3ed 1px, transparent 1px), linear-gradient(to bottom, #f7f3ed 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 80% 70% at 60% 40%, black 30%, transparent 75%)",
        }}
      />
      <svg className="absolute inset-x-0 bottom-0 h-[55%] w-full opacity-40" viewBox="0 0 800 400" preserveAspectRatio="none">
        <defs>
          <linearGradient id="curve" x1="0" x2="1">
            <stop offset="0" stopColor="#f7f3ed" stopOpacity="0" />
            <stop offset="0.6" stopColor="#e0697f" stopOpacity="0.6" />
            <stop offset="1" stopColor="#f7f3ed" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        {[0, 1, 2].map((i) => (
          <motion.path
            key={i}
            d={`M0 ${360 - i * 22} C 180 ${350 - i * 30}, 300 ${300 - i * 40}, 460 ${230 - i * 34} S 700 ${90 - i * 20}, 820 ${40 - i * 10}`}
            fill="none"
            stroke="url(#curve)"
            strokeWidth={1.2}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 - i * 0.25 }}
            transition={{ duration: 2.4, delay: 0.4 + i * 0.25, ease }}
          />
        ))}
      </svg>
      <div className="noise absolute inset-0" />
    </div>
  );
}

function PreviewChart() {
  const pts = [22, 26, 25, 31, 34, 33, 39, 43, 47, 52, 58, 71];
  const w = 300;
  const h = 84;
  const x = (i: number) => (i / (pts.length - 1)) * w;
  const y = (v: number) => h - 6 - ((v - 18) / (75 - 18)) * (h - 14);
  const line = pts.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-[84px] w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="pv-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e0697f" stopOpacity="0.32" />
          <stop offset="1" stopColor="#e0697f" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((t) => (
        <line key={t} x1="0" x2={w} y1={h * t} y2={h * t} stroke="#f7f3ed" strokeOpacity="0.06" />
      ))}
      <motion.path
        d={`${line} L${w},${h} L0,${h} Z`}
        fill="url(#pv-fill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke="#e0697f"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.6, delay: 0.7, ease }}
      />
    </svg>
  );
}

/** A floating, illustrative glimpse of the portal. */
function ProductGlimpse() {
  return (
    <div className="relative mx-auto mt-12 mb-8 w-full max-w-[460px]" aria-hidden>
      <div
        style={{ animationDelay: "350ms" }}
        className="animate-rise rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-md"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[12px] text-ivory/55">Revenue this month</p>
            <p className="mt-1 text-[30px] leading-none font-semibold tracking-[-0.03em] text-ivory">$18,430</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#5cc493]/12 px-2 py-1 text-[11.5px] font-medium text-[#7fd6ab]">
            <ArrowUpRight className="size-3.5" /> 18.4%
          </span>
        </div>
        <div className="mt-4">
          <PreviewChart />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/[0.07] pt-4">
          {[
            ["Qualified leads", "1,284"],
            ["ROAS", "4.8x"],
            ["GEO score", "74/100"],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-[11px] text-ivory/45">{k}</p>
              <p className="mt-0.5 text-[15px] font-semibold tracking-tight text-ivory/90">{v}</p>
            </div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.9, ease }}
        className="absolute -top-7 -right-4 sm:-right-10"
      >
        <div className="flex animate-[float_7s_ease-in-out_infinite] items-center gap-2.5 rounded-xl border border-white/10 bg-[#24131a]/90 py-2 pr-3.5 pl-2.5 shadow-xl backdrop-blur-md">
          <span className="grid size-7 place-items-center rounded-lg bg-[#e0697f]/15 text-[#ec8b9c]">
            <Sparkles className="size-3.5" />
          </span>
          <div className="leading-tight">
            <p className="text-[11.5px] font-medium text-ivory">3 growth opportunities</p>
            <p className="text-[10.5px] text-ivory/50">Festro AI · ≈ +$5.9K</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.2, ease }}
        className="absolute -bottom-12 left-6 sm:left-10"
      >
        <div className="flex animate-[float_8s_ease-in-out_1s_infinite] items-center gap-2.5 rounded-xl border border-white/10 bg-[#24131a]/90 py-2 pr-3.5 pl-2 shadow-xl backdrop-blur-md">
          <span className="grid size-7 place-items-center rounded-full bg-[hsl(18_40%_30%)] text-[10.5px] font-semibold text-[hsl(18_70%_85%)]">HL</span>
          <div className="leading-tight">
            <p className="text-[11.5px] font-medium text-ivory">New qualified lead</p>
            <p className="text-[10.5px] text-ivory/50">Lumen Dental Group · score 86</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function BrandPanel() {
  return (
    <section
      aria-labelledby="brand-heading"
      className="relative isolate flex flex-col overflow-hidden bg-[#230e15] bg-[linear-gradient(150deg,#1d0c12_0%,#2c0f18_45%,#140709_100%)] px-6 pt-5 pb-7 text-ivory sm:px-10 sm:pb-10 lg:min-h-dvh lg:px-14 lg:pt-10 lg:pb-10"
    >
      <Atmosphere />

      <div className="relative flex items-center justify-between">
        <Logo tone="light" size="lg" />
        <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11.5px] font-medium tracking-wide text-ivory/70 sm:inline-block">
          Client platform
        </span>
      </div>

      <div className="relative mx-auto flex w-full max-w-xl flex-1 flex-col justify-center pt-7 sm:pt-10 lg:pt-0">
        <p className="animate-rise flex items-center gap-2 text-[12px] font-medium tracking-[0.14em] text-[#e7b8c2]/80 uppercase">
          <span className="h-px w-6 bg-[#e7b8c2]/50" aria-hidden />
          Festro Digital Growth Portal
        </p>
        <h1
          id="brand-heading"
          style={{ animationDelay: "80ms" }}
          className="animate-rise mt-4 text-[34px] leading-[1.04] font-semibold tracking-[-0.04em] sm:mt-5 sm:text-[52px] xl:text-[60px]"
        >
          Digital growth.
          <br />
          Built{" "}
          <span className="font-display text-[1.08em] font-normal tracking-[-0.01em] italic text-gradient-brand">smarter.</span>
        </h1>
        <p style={{ animationDelay: "160ms" }} className="animate-rise mt-3 max-w-md text-[14px] leading-relaxed text-ivory/65 sm:mt-5 sm:text-[15px]">
          Growth, technology and digital systems engineered for modern businesses. Strategy, websites, search, paid media and AI automation in one
          measurable operating system.
        </p>

        <div className="hidden lg:block">
          <ProductGlimpse />
        </div>
      </div>

      <div className="relative mx-auto mt-10 hidden w-full max-w-xl sm:block lg:mt-6">
        <h2 className="sr-only">What Festro delivers</h2>
        <ul className="flex flex-wrap gap-x-2 gap-y-2">
          {capabilities.map((c, i) => (
            <li key={c} style={{ animationDelay: `${500 + i * 50}ms` }} className="animate-rise rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-[12px] text-ivory/70">
              {c}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
