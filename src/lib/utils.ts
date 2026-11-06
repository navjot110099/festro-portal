import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/** Teach tailwind-merge the custom type scale so `text-caption` isn't mistaken for a colour. */
const twMerge = extendTailwindMerge({
  extend: { classGroups: { "font-size": [{ text: ["micro", "caption", "body", "title"] }] } },
});

/** Compose class names, letting later Tailwind utilities win over earlier ones. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
