import { sleep } from "@/lib/utils";

/**
 * Demo transport.
 *
 * Every resource in `src/lib/api` goes through `request()`. Today it resolves
 * mock data after a realistic delay. To connect a real backend, change
 * `request()` to call `fetch(`${API_URL}${path}`)` (or a Supabase query) and
 * keep the resource signatures. Components never import mock data directly.
 *
 * The demo mode lets reviewers preview every state a section can be in.
 */
export type DemoMode = "live" | "empty" | "error";

export const DEMO_MODE_KEY = "fh-demo-mode";
export const DEMO_MODE_EVENT = "fh-demo-mode-change";

export function getDemoMode(): DemoMode {
  if (typeof window === "undefined") return "live";
  try {
    const v = window.localStorage.getItem(DEMO_MODE_KEY);
    return v === "empty" || v === "error" ? v : "live";
  } catch {
    return "live";
  }
}

export function setDemoMode(mode: DemoMode) {
  try {
    window.localStorage.setItem(DEMO_MODE_KEY, mode);
  } catch {
    /* storage unavailable — mode stays in memory for this view only */
  }
  window.dispatchEvent(new CustomEvent(DEMO_MODE_EVENT, { detail: mode }));
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 500,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions<T> {
  /** What the endpoint returns for a workspace with no data yet. */
  empty: T;
  /** Simulated latency in ms. */
  latency?: number;
}

export async function request<T>(path: string, resolve: () => T, { empty, latency = 650 }: RequestOptions<T>): Promise<T> {
  const mode = getDemoMode();
  await sleep(latency + Math.random() * 250);
  if (mode === "error") throw new ApiError(`We couldn't load ${path.replace(/^\//, "").replace(/\//g, " › ")}. The data source didn't respond.`, 503);
  if (mode === "empty") return empty;
  return resolve();
}
