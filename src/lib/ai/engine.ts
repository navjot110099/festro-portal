import { detectIntent, responses, type AiIntent } from "@/data/ai";
import { getDemoMode } from "@/lib/api/client";
import { sleep } from "@/lib/utils";
import type { AiResponse } from "@/types";

/**
 * Festro AI — demo engine.
 *
 * Production wiring: POST the prompt and a compact workspace context
 * (KPIs, top campaigns, pipeline, SEO scores) to a server route that calls
 * your model provider with a JSON schema matching `AiBlock`, and stream the
 * blocks back. The UI already renders progressively, so only this file changes.
 */
export async function askAssistant(prompt: string, forced?: AiIntent): Promise<{ intent: AiIntent; response: AiResponse }> {
  const intent = forced ?? detectIntent(prompt);
  await sleep(350);
  if (getDemoMode() === "error") {
    throw new Error("Festro AI couldn't reach your data sources. Check your integrations and try again.");
  }
  return { intent, response: responses[intent] };
}
