import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import {
  EditableList,
  EditableText,
  ErrorNote,
  GenerateButton,
  LoadingPanel,
} from "@/components/ai-output";
import { Textarea } from "@/components/ui/textarea";
import { researchTopic, type ResearchResult } from "@/lib/ai.functions";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Northwork" },
      {
        name: "description",
        content:
          "Enter a topic, paste text or drop an article link to get AI insights, findings and recommendations you can edit.",
      },
      { property: "og:title", content: "AI Research Assistant — Northwork" },
      {
        property: "og:description",
        content: "Summaries, insights and recommendations generated from your own source material.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Research,
});

function Research() {
  const run = useServerFn(researchTopic);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    const text = input.trim();
    if (text.length < 3) {
      setError("Enter a research topic, paste some text, or add an article link.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      setResult(await run({ data: { input: text } }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const patch = (partial: Partial<ResearchResult>) =>
    setResult((prev) => (prev ? { ...prev, ...partial } : prev));

  return (
    <AppShell
      title="AI Research Assistant"
      description="Give the AI a topic, pasted source text, or a link to an article. It reads the material and reports back."
    >
      <div className="space-y-5">
        <div className="surface-panel p-5 sm:p-6">
          <label htmlFor="research" className="text-sm font-medium">
            Topic, text or link
          </label>
          <Textarea
            id="research"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"e.g. https://example.com/article\nor paste the text you want analysed"}
            className="mt-2 min-h-48 resize-y bg-background"
          />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-muted-foreground">
              Links are fetched and read live; some sites block automated reading.
            </span>
            <GenerateButton loading={loading} onClick={generate} label="Generate with AI" />
          </div>
        </div>

        <ErrorNote message={error} />
        {loading && <LoadingPanel lines={6} />}

        {result && (
          <div className="space-y-4">
            <EditableText
              label="Summary"
              value={result.summary}
              onChange={(summary) => patch({ summary })}
            />
            <EditableList
              label="Key insights"
              items={result.keyInsights}
              onChange={(keyInsights) => patch({ keyInsights })}
            />
            <EditableList
              label="Important findings"
              items={result.importantFindings}
              onChange={(importantFindings) => patch({ importantFindings })}
            />
            <EditableList
              label="Recommendations"
              items={result.recommendations}
              onChange={(recommendations) => patch({ recommendations })}
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}
