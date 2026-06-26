import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const Input = z.object({
  teamA: z.string().min(1).max(60),
  teamB: z.string().min(1).max(60),
  stage: z.string().max(40).optional(),
});

export const predictMatch = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY not configured");
    const gateway = createLovableAiGatewayProvider(key);

    const prompt = `You are a football (soccer) analyst predicting a 2026 FIFA World Cup match.

Match: ${data.teamA} vs ${data.teamB}${data.stage ? ` (${data.stage})` : ""}

Provide:
1. Predicted scoreline (e.g. "2-1")
2. Predicted winner (or "Draw")
3. Confidence (Low / Medium / High)
4. A 2-3 sentence tactical reasoning grounded in recent form, FIFA ranking, and historical head-to-head context you know.

Be measured. If you don't know recent form, say so. Do not invent statistics.

Format strictly as:
SCORE: <score>
WINNER: <team or Draw>
CONFIDENCE: <Low|Medium|High>
REASONING: <text>`;

    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      prompt,
    });

    return { raw: text };
  });