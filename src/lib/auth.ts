import { demoAccount, currentUser } from "@/data/user";
import { sleep } from "@/lib/utils";

/**
 * Mock authentication for the portfolio build.
 *
 * The session is a cookie so the edge `proxy.ts` can protect portal routes
 * before anything renders. To go to production, replace `signIn` with a call
 * to your identity provider (Supabase Auth, Auth.js, Clerk…) and have it set
 * an httpOnly session cookie server-side; the proxy check stays the same.
 */

export const SESSION_COOKIE = "fh_session";
const REMEMBER_DAYS = 30;

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export async function signIn({ email, password, remember }: { email: string; password: string; remember: boolean }) {
  // Simulated network + verification latency so the loading state is visible.
  await sleep(1100);

  const id = email.trim().toLowerCase();
  const knownEmail = [demoAccount.email, ...demoAccount.aliases].some((e) => e.toLowerCase() === id);
  if (!knownEmail || password !== demoAccount.password) {
    throw new AuthError("Those details don't match our records. Check your email and password and try again.");
  }

  const maxAge = remember ? `; max-age=${REMEMBER_DAYS * 24 * 60 * 60}` : "";
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(currentUser.id)}; path=/; samesite=lax${maxAge}`;
  return currentUser;
}

export async function requestPasswordReset(email: string) {
  await sleep(900);
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new AuthError("Enter a valid email address.");
  return { sentTo: email };
}

export function signOut() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
}
