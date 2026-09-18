import { Loader2, Plus, Sparkles, Trash2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

export function GenerateButton({
  loading,
  onClick,
  label = "Generate with AI",
  disabled,
}: {
  loading: boolean;
  onClick: () => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <Button onClick={onClick} disabled={loading || disabled} size="lg" className="w-full sm:w-auto">
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" /> Generating…
        </>
      ) : (
        <>
          <Sparkles className="size-4" /> {label}
        </>
      )}
    </Button>
  );
}

export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function LoadingPanel({ lines = 5 }: { lines?: number }) {
  return (
    <div className="surface-panel space-y-3 p-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> The AI is working through your input…
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" style={{ width: `${95 - i * 9}%` }} />
      ))}
    </div>
  );
}

export function EditableText({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <section className="surface-panel p-5 sm:p-6">
      <h3 className="mb-3 text-sm font-semibold tracking-wide text-navy uppercase">{label}</h3>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-28 resize-y bg-background"
      />
    </section>
  );
}

export function EditableList({
  label,
  items,
  onChange,
  emptyLabel = "The AI found nothing for this section in your input.",
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  emptyLabel?: string;
}) {
  const update = (index: number, value: string) =>
    onChange(items.map((item, i) => (i === index ? value : item)));

  return (
    <section className="surface-panel p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-wide text-navy uppercase">{label}</h3>
        <Button variant="ghost" size="sm" onClick={() => onChange([...items, ""])}>
          <Plus className="size-4" /> Add
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="mt-3.5 size-1.5 shrink-0 rounded-full bg-navy-soft" />
              <Textarea
                value={item}
                onChange={(e) => update(index, e.target.value)}
                className="min-h-11 resize-y bg-background py-2"
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remove item"
                className="mt-0.5 text-muted-foreground hover:text-destructive"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
