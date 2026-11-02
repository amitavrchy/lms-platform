import { CheckCircle2 } from "lucide-react";

function values(input: unknown): string[] {
  if (Array.isArray(input)) return input.filter((item): item is string => typeof item === "string");
  if (input && typeof input === "object") {
    const record = input as Record<string, unknown>;
    return values(record.outcomes ?? record.learningOutcomes ?? record.items);
  }
  return [];
}

export function CourseOutcomes({ outcomes }: { outcomes?: unknown }) {
  const items = values(outcomes);
  if (!items.length) return null;

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <h2 className="text-[16px] font-semibold">By the end of this course</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="flex gap-3 text-[14px] leading-6 text-[var(--muted)]">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[var(--success)]" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
