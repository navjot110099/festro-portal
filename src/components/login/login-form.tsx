"use client";

import { AnimatePresence, motion, useAnimate } from "framer-motion";
import { ArrowRight, Check, Copy, Eye, EyeOff, KeyRound, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Modal } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/input";
import { demoAccount } from "@/data/user";
import { AuthError, requestPasswordReset, signIn } from "@/lib/auth";
import { sleep } from "@/lib/utils";

type Phase = "idle" | "submitting" | "success";

function safeNext() {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export function LoginForm() {
  const router = useRouter();
  const ids = { email: useId(), password: useId(), remember: useId(), error: useId() };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [formScope, animateForm] = useAnimate<HTMLFormElement>();
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [forgotOpen, setForgotOpen] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const shake = () => {
    if (formScope.current) animateForm(formScope.current, { x: [0, -7, 7, -5, 5, -2, 0] }, { duration: 0.42 });
  };

  const validate = () => {
    const errs: typeof fieldErrors = {};
    if (!email.trim()) errs.email = "Enter your email or username.";
    if (!password) errs.password = "Enter your password.";
    setFieldErrors(errs);
    if (errs.email) emailRef.current?.focus();
    else if (errs.password) passwordRef.current?.focus();
    return !errs.email && !errs.password;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phase !== "idle") return;
    setError(null);
    if (!validate()) {
      shake();
      return;
    }
    setPhase("submitting");
    try {
      await signIn({ email, password, remember });
      setPhase("success");
      await sleep(650);
      router.replace(safeNext());
      router.refresh();
    } catch (err) {
      setPhase("idle");
      setError(err instanceof AuthError ? err.message : "We couldn't sign you in. Please try again.");
      shake();
      window.setTimeout(() => passwordRef.current?.select(), 0);
    }
  };

  /** Types the demo credentials in, so reviewers see the flow rather than a jump. */
  const fillDemo = async () => {
    setError(null);
    setFieldErrors({});
    setEmail("");
    setPassword("");
    for (let i = 1; i <= demoAccount.email.length; i++) {
      setEmail(demoAccount.email.slice(0, i));
      await sleep(14);
    }
    for (let i = 1; i <= demoAccount.password.length; i++) {
      setPassword(demoAccount.password.slice(0, i));
      await sleep(20);
    }
    passwordRef.current?.focus();
  };

  const busy = phase !== "idle";

  return (
    <div className="w-full max-w-[400px]">
      <div className="animate-rise">
        <p className="text-[12px] font-medium tracking-[0.12em] text-accent-ink uppercase">Client sign in</p>
        <h2 className="mt-2 text-[26px] leading-tight font-semibold tracking-[-0.03em] text-fg sm:mt-3 sm:text-[30px]">Welcome back</h2>
        <p className="mt-2 text-[14px] text-muted">Sign in to your growth workspace to see performance, leads and what to do next.</p>
      </div>

      <form
        ref={formScope}
        noValidate
        onSubmit={onSubmit}
        className="mt-6 space-y-5 sm:mt-8"
        aria-describedby={error ? ids.error : undefined}
      >
        <Field label="Email or username" htmlFor={ids.email} error={fieldErrors.email}>
          <Input
            ref={emailRef}
            id={ids.email}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            placeholder="you@company.com"
            inputSize="lg"
            leading={<Mail />}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: undefined }));
            }}
            aria-invalid={Boolean(fieldErrors.email) || undefined}
            aria-describedby={fieldErrors.email ? `${ids.email}-error` : undefined}
            disabled={busy}
          />
        </Field>

        <Field
          label="Password"
          htmlFor={ids.password}
          error={fieldErrors.password}
          aside={
            <button type="button" onClick={() => setForgotOpen(true)} className="text-[12.5px] font-medium text-accent-ink hover:underline">
              Forgot password?
            </button>
          }
        >
          <Input
            ref={passwordRef}
            id={ids.password}
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            inputSize="lg"
            leading={<Lock />}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: undefined }));
            }}
            aria-invalid={Boolean(fieldErrors.password) || undefined}
            aria-describedby={fieldErrors.password ? `${ids.password}-error` : undefined}
            disabled={busy}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="grid size-8 place-items-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-fg"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
          />
        </Field>

        <label htmlFor={ids.remember} className="flex w-fit cursor-pointer items-center gap-2.5 text-[13px] text-fg-2 select-none">
          <Checkbox id={ids.remember} checked={remember} onChange={(e) => setRemember(e.target.checked)} disabled={busy} />
          Keep me signed in for 30 days
        </label>

        <div aria-live="assertive" id={ids.error}>
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden rounded-lg border border-danger/20 bg-danger-soft px-3 py-2.5 text-[13px] text-danger"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <Button type="submit" size="lg" className="group w-full overflow-hidden" disabled={busy} aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            {phase === "idle" && (
              <motion.span key="idle" className="inline-flex items-center gap-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                Sign in <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </motion.span>
            )}
            {phase === "submitting" && (
              <motion.span key="submitting" className="inline-flex items-center gap-2.5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <span className="flex gap-1" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="size-1.5 rounded-full bg-brand-fg"
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.14 }}
                    />
                  ))}
                </span>
                Verifying
              </motion.span>
            )}
            {phase === "success" && (
              <motion.span key="success" className="inline-flex items-center gap-2" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <Check /> Welcome, Deep
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </form>

      <DemoAccess onUse={fillDemo} disabled={busy} />

      <ForgotPasswordDialog open={forgotOpen} onOpenChange={setForgotOpen} defaultEmail={email} />
    </div>
  );
}

function DemoAccess({ onUse, disabled }: { onUse: () => void; disabled: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${demoAccount.email} / ${demoAccount.password}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked; credentials remain visible */
    }
  };
  return (
    <div style={{ animationDelay: "250ms" }} className="animate-rise mt-8 rounded-xl border border-dashed border-line-strong bg-surface-2/70 p-4">
      <div className="flex items-start gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent-ink">
          <KeyRound className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-fg">Demo access</p>
          <p className="mt-0.5 text-[12.5px] text-muted">Explore the full portal with illustrative data.</p>
          <dl className="mt-2.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[12px]">
            <dt className="text-subtle">email</dt>
            <dd className="truncate text-fg-2">{demoAccount.email}</dd>
            <dt className="text-subtle">pass</dt>
            <dd className="text-fg-2">{demoAccount.password}</dd>
          </dl>
        </div>
      </div>
      <div className="mt-3.5 flex gap-2">
        <Button variant="secondary" size="sm" className="flex-1" onClick={onUse} disabled={disabled}>
          Use demo account
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={copy} aria-label={copied ? "Copied" : "Copy demo credentials"}>
          {copied ? <Check className="text-success" /> : <Copy />}
        </Button>
      </div>
    </div>
  );
}

function ForgotPasswordDialog({ open, onOpenChange, defaultEmail }: { open: boolean; onOpenChange: (v: boolean) => void; defaultEmail: string }) {
  const id = useId();
  const [email, setEmail] = useState(defaultEmail);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const change = (v: boolean) => {
    onOpenChange(v);
    if (v) {
      setEmail(defaultEmail);
      setState("idle");
      setError(null);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setState("sending");
    try {
      await requestPasswordReset(email);
      setState("sent");
    } catch (err) {
      setState("idle");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <Modal open={open} onOpenChange={change} title="Reset your password" description="We'll email you a secure link to choose a new password." size="sm">
      <AnimatePresence mode="wait" initial={false}>
        {state === "sent" ? (
          <motion.div key="sent" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-1" role="status">
            <div className="flex items-start gap-3 rounded-xl bg-success-soft p-3.5">
              <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
              <p className="text-[13px] text-fg-2">
                If an account exists for <span className="font-medium text-fg">{email}</span>, a reset link is on its way. It expires in 30 minutes.
              </p>
            </div>
            <p className="text-[12px] text-subtle">Demo environment: no email is actually sent.</p>
            <Button className="w-full" variant="secondary" onClick={() => change(false)}>
              Back to sign in
            </Button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} className="space-y-4 pt-1" noValidate>
            <Field label="Work email" htmlFor={id} error={error ?? undefined}>
              <Input
                id={id}
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                leading={<Mail />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(error) || undefined}
                autoFocus
              />
            </Field>
            <Button type="submit" className="w-full" loading={state === "sending"}>
              Send reset link
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </Modal>
  );
}
