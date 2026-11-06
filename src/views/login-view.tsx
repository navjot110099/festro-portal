"use client";

import { BrandPanel } from "@/components/login/brand-panel";
import { LoginForm } from "@/components/login/login-form";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function LoginView() {
  return (
    <div className="grid min-h-dvh bg-bg lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)]">
      <BrandPanel />
      <main className="relative flex flex-col px-6 pt-4 pb-8 sm:px-10 sm:py-8 lg:min-h-dvh lg:py-10" aria-label="Sign in">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_70%_0%,var(--accent-soft),transparent_70%)]" aria-hidden />
        <div className="relative flex items-center justify-end">
          <ThemeToggle />
        </div>
        <div className="relative -mt-6 flex flex-1 items-center justify-center pb-10 sm:mt-0 sm:py-10">
          <LoginForm />
        </div>
        <footer className="relative flex flex-col items-center justify-between gap-2 text-[12px] text-subtle sm:flex-row">
          <p>© {new Date().getFullYear()} Festro. Digital Growth. Built Smarter.</p>
          <p>Private client platform</p>
        </footer>
      </main>
    </div>
  );
}
