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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { planTasks, type PlannerResult } from "@/lib/ai.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/task-planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Northwork" },
      {
        name: "description",
        content:
          "Enter tasks, priorities and deadlines and get an AI-built daily or weekly schedule you can edit.",
      },
      { property: "og:title", content: "AI Task Planner — Northwork" },
      {
        property: "og:description",
        content: "A prioritised, editable schedule built from your own tasks and deadlines.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TaskPlanner,
});

function TaskPlanner() {
  const run = useServerFn(planTasks);
  const [tasks, setTasks] = useState("");
  const [horizon, setHorizon] = useState<"daily" | "weekly">("daily");
  const [hoursPerDay, setHoursPerDay] = useState("");
  const [result, setResult] = useState<PlannerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    const text = tasks.trim();
    if (text.length < 5) {
      setError("Add at least one task, with its priority and deadline if you have them.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      setResult(await run({ data: { tasks: text, horizon, hoursPerDay } }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const patch = (partial: Partial<PlannerResult>) =>
    setResult((prev) => (prev ? { ...prev, ...partial } : prev));

  return (
    <AppShell
      title="AI Task Planner"
      description="List what you need to get done, with priorities and deadlines. The AI turns it into a realistic, editable schedule."
    >
      <div className="space-y-5">
        <div className="surface-panel p-5 sm:p-6">
          <label htmlFor="tasks" className="text-sm font-medium">
            Tasks, priorities and deadlines
          </label>
          <Textarea
            id="tasks"
            value={tasks}
            onChange={(e) => setTasks(e.target.value)}
            placeholder={
              "Finish Q3 board deck — high priority — due Thursday\nReview vendor contract — medium — due next Monday\nOnboard new intern — low — no deadline"
            }
            className="mt-2 min-h-48 resize-y bg-background"
          />

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <span className="text-sm font-medium">Plan type</span>
              <div className="mt-2 inline-flex rounded-lg border border-border bg-muted p-1">
                {(["daily", "weekly"] as const).map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setHorizon(option)}
                    className={cn(
                      "capitalize",
                      horizon === option && "bg-navy text-primary-foreground hover:bg-navy",
                    )}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="hours" className="text-sm font-medium">
                Focus hours per day (optional)
              </label>
              <Input
                id="hours"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(e.target.value)}
                placeholder="e.g. 6"
                className="mt-2 bg-background"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <GenerateButton loading={loading} onClick={generate} label="Generate schedule with AI" />
          </div>
        </div>

        <ErrorNote message={error} />
        {loading && <LoadingPanel lines={6} />}

        {result && (
          <div className="space-y-4">
            <EditableText
              label="Plan overview"
              value={result.overview}
              onChange={(overview) => patch({ overview })}
            />
            <EditableList
              label="Priority order"
              items={result.priorityOrder}
              onChange={(priorityOrder) => patch({ priorityOrder })}
            />
            {result.blocks.map((block, index) => (
              <EditableList
                key={index}
                label={block.title}
                items={block.items}
                onChange={(items) =>
                  patch({
                    blocks: result.blocks.map((b, i) => (i === index ? { ...b, items } : b)),
                  })
                }
              />
            ))}
            <EditableList label="Tips" items={result.tips} onChange={(tips) => patch({ tips })} />
          </div>
        )}
      </div>
    </AppShell>
  );
}
