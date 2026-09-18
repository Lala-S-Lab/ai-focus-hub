import { createServerFn } from "@tanstack/react-start";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";

import { createLovableAiGatewayRunIdFetch } from "./ai-gateway.server";

const MODEL = "openai/gpt-6-astra";

function getModel() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured. Please try again later.");
  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const lovable = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: key,
    headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  return lovable.responses(MODEL);
}

const providerOptions = {
  openai: {
    forceReasoning: true,
    reasoningEffort: "low",
    reasoningSummary: "auto",
    store: false,
    include: ["reasoning.encrypted_content"],
  },
} as const;

async function generate<T>(schema: z.ZodType<T>, system: string, prompt: string): Promise<T> {
  try {
    const result = streamText({
      model: getModel(),
      system,
      prompt,
      output: Output.object({ schema }),
      providerOptions,
    });
    return (await result.output) as T;
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      throw new Error("The AI response could not be read. Please try again.");
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("402")) {
      throw new Error("AI credits are exhausted. Please add credits to continue.");
    }
    if (message.includes("429")) {
      throw new Error("Too many requests right now. Please wait a moment and try again.");
    }
    throw new Error(message);
  }
}

const MeetingSchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
  actionItems: z.array(z.string()),
  decisions: z.array(z.string()),
  deadlines: z.array(z.string()),
});
export type MeetingResult = z.infer<typeof MeetingSchema>;

export const analyzeMeetingNotes = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ notes: z.string().min(20) }).parse(input))
  .handler(async ({ data }) =>
    generate(
      MeetingSchema,
      [
        "You are a precise meeting analyst for a workplace productivity tool.",
        "Extract ONLY information grounded in the user's notes. Never invent names, dates or decisions.",
        "If a section has nothing in the notes, return an empty array for it.",
        "Summary: 2-4 sentences. Key points, action items, decisions and deadlines: short concrete lines.",
        "Action items should name the owner when the notes mention one. Deadlines must include the stated date or timeframe.",
      ].join(" "),
      `Meeting notes:\n\n${data.notes}`,
    ),
  );

const PlannerSchema = z.object({
  overview: z.string(),
  blocks: z.array(z.object({ title: z.string(), items: z.array(z.string()) })),
  priorityOrder: z.array(z.string()),
  tips: z.array(z.string()),
});
export type PlannerResult = z.infer<typeof PlannerSchema>;

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        tasks: z.string().min(5),
        horizon: z.enum(["daily", "weekly"]),
        hoursPerDay: z.string(),
      })
      .parse(input),
  )
  .handler(async ({ data }) =>
    generate(
      PlannerSchema,
      [
        "You are an expert workplace planner.",
        "Build a realistic schedule from ONLY the tasks, priorities and deadlines the user provides.",
        "Order work by urgency and importance, respecting stated deadlines and available hours.",
        "For a daily plan, blocks are time slots (e.g. 09:00-10:30). For a weekly plan, blocks are days.",
        "Each block item must reference one of the user's real tasks. Keep tips practical and specific to this workload.",
      ].join(" "),
      `Planning horizon: ${data.horizon}\nAvailable focus hours per day: ${data.hoursPerDay || "not specified"}\n\nTasks, priorities and deadlines:\n${data.tasks}`,
    ),
  );

const ResearchSchema = z.object({
  summary: z.string(),
  keyInsights: z.array(z.string()),
  importantFindings: z.array(z.string()),
  recommendations: z.array(z.string()),
});
export type ResearchResult = z.infer<typeof ResearchSchema>;

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ input: z.string().min(3) }).parse(input))
  .handler(async ({ data }) => {
    const raw = data.input.trim();
    const isUrl = /^https?:\/\/\S+$/i.test(raw);
    let content = raw;
    let sourceNote = "The user provided a topic or pasted text.";

    if (isUrl) {
      try {
        const res = await fetch(raw, {
          headers: { "user-agent": "Mozilla/5.0 (compatible; ResearchAssistant/1.0)" },
        });
        if (!res.ok) throw new Error(String(res.status));
        const text = stripHtml(await res.text()).slice(0, 40000);
        if (text.length < 200) {
          throw new Error("empty");
        }
        content = text;
        sourceNote = `The content below was fetched from ${raw}.`;
      } catch {
        throw new Error(
          "That page could not be read. Paste the article text directly, or try another link.",
        );
      }
    }

    return generate(
      ResearchSchema,
      [
        "You are a rigorous research assistant for workplace professionals.",
        "Ground every line in the provided material; if it is only a topic, stay factual and flag uncertainty inside the relevant line.",
        "Summary: a tight paragraph. Insights, findings and recommendations: specific, non-generic, actionable lines.",
      ].join(" "),
      `${sourceNote}\n\n${content}`,
    );
  });
