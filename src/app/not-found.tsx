import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6">
      <div className="max-w-md text-center">
        <Logo className="justify-center" />
        <p className="mt-10 font-mono text-xs tracking-widest text-subtle">ERROR 404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-fg">This page took a different route.</h1>
        <p className="mt-3 text-muted">The page you’re looking for doesn’t exist or has moved.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/dashboard" className="inline-flex h-10 items-center rounded-xl bg-brand px-4 text-sm font-medium text-brand-fg shadow-brand transition-colors hover:bg-brand-hover">
            Go to dashboard
          </Link>
          <Link href="/" className="inline-flex h-10 items-center rounded-xl border border-line bg-surface px-4 text-sm font-medium text-fg transition-colors hover:bg-surface-2">
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
