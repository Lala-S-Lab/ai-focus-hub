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
import { analyzeMeetingNotes, type MeetingResult } from "@/lib/ai.functions";

export const Route = createFileRoute("/meeting-notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes AI — Northwork" },
      {
        name: "description",
        content:
          "Paste meeting notes and get an AI summary, key points, action items, decisions and deadlines you can edit.",
      },
      { property: "og:title", content: "Meeting Notes AI — Northwork" },
      {
        property: "og:description",
        content: "Turn messy meeting notes into a structured, editable recap with AI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MeetingNotes,
});

function MeetingNotes() {
  const run = useServerFn(analyzeMeetingNotes);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<MeetingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    const text = notes.trim();
    if (text.length < 20) {
      setError("Please paste at least a couple of sentences of meeting notes.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      setResult(await run({ data: { notes: text } }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const patch = (partial: Partial<MeetingResult>) =>
    setResult((prev) => (prev ? { ...prev, ...partial } : prev));

  return (
    <AppShell
      title="Meeting Notes AI"
      description="Paste the raw notes from your meeting. The AI reads only what you provide and structures it into an editable recap."
    >
      <div className="space-y-5">
        <div className="surface-panel p-5 sm:p-6">
          <label htmlFor="notes" className="text-sm font-medium">
            Meeting notes
          </label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste your notes, transcript or bullet points here…"
            className="mt-2 min-h-56 resize-y bg-background"
          />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-muted-foreground">
              {notes.trim().length} characters · not stored anywhere
            </span>
            <GenerateButton loading={loading} onClick={generate} />
          </div>
        </div>

        <ErrorNote message={error} />
        {loading && <LoadingPanel />}

        {result && (
          <div className="space-y-4">
            <EditableText
              label="Summary"
              value={result.summary}
              onChange={(summary) => patch({ summary })}
            />
            <EditableList
              label="Key points"
              items={result.keyPoints}
              onChange={(keyPoints) => patch({ keyPoints })}
            />
            <EditableList
              label="Action items"
              items={result.actionItems}
              onChange={(actionItems) => patch({ actionItems })}
            />
            <EditableList
              label="Decisions"
              items={result.decisions}
              onChange={(decisions) => patch({ decisions })}
            />
            <EditableList
              label="Deadlines"
              items={result.deadlines}
              onChange={(deadlines) => patch({ deadlines })}
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}
