"use client";

import { AnimatePresence, motion, useAnimate } from "framer-motion";
import { ArrowRight, Check, Eye, EyeOff, LoaderCircle, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Modal } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/input";
import { currentUser } from "@/data/user";
import { AuthError, requestPasswordReset, signIn, signInWithSavedAccount } from "@/lib/auth";
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
  /** Which control started the current sign-in, so only that one shows progress. */
  const [via, setVia] = useState<"form" | "quick">("form");
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
    setVia("form");
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

  const onQuickSignIn = async () => {
    if (phase !== "idle") return;
    setError(null);
    setFieldErrors({});
    setVia("quick");
    setPhase("submitting");
    try {
      await signInWithSavedAccount(remember);
      setPhase("success");
      await sleep(450);
      router.replace(safeNext());
      router.refresh();
    } catch {
      setPhase("idle");
      setError("We couldn't sign you in. Please try again.");
    }
  };

  const busy = phase !== "idle";
  const formBusy = busy && via === "form";

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
            {(phase === "idle" || via === "quick") && (
              <motion.span key="idle" className="inline-flex items-center gap-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                Sign in <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </motion.span>
            )}
            {formBusy && phase === "submitting" && (
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
            {formBusy && phase === "success" && (
              <motion.span key="success" className="inline-flex items-center gap-2" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <Check /> Welcome, Deep
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </form>

      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-3 text-caption text-subtle" aria-hidden>
          <span className="h-px flex-1 bg-line" />
          or continue with a saved account
          <span className="h-px flex-1 bg-line" />
        </div>
        <button
          type="button"
          onClick={onQuickSignIn}
          disabled={busy}
          aria-label={`Continue as ${currentUser.name}, ${currentUser.workspace}`}
          className="group flex w-full items-center gap-3 rounded-xl border border-line bg-surface p-3 text-left shadow-xs transition-[border-color,box-shadow,transform] duration-200 hover:border-line-strong hover:shadow-sm active:scale-[0.99] disabled:opacity-60"
        >
          <Avatar initials={currentUser.initials} hue={348} size="md" />
          <span className="min-w-0 flex-1">
            <span className="block text-body font-medium text-fg">Continue as {currentUser.name}</span>
            <span className="block truncate text-caption text-muted">
              {currentUser.workspace} · {currentUser.role}
            </span>
          </span>
          <span className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition-colors group-hover:bg-surface-2 group-hover:text-fg" aria-hidden>
            {via === "quick" && phase === "submitting" ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : via === "quick" && phase === "success" ? (
              <Check className="size-4 text-success" />
            ) : (
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            )}
          </span>
        </button>
      </div>

      <ForgotPasswordDialog open={forgotOpen} onOpenChange={setForgotOpen} defaultEmail={email} />
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
