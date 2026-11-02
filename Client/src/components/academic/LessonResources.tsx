"use client";

import { FileText, Link as LinkIcon, Target } from "lucide-react";
import { AcademicMarkdown } from "./AcademicMarkdown";

type Resource = { title?: string; url?: string; href?: string; type?: string };

function list(value: unknown): Resource[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Resource => Boolean(item && typeof item === "object"));
}

export function LessonResources({
  objectives,
  transcript,
  resources,
}: {
  objectives?: unknown;
  transcript?: string | null;
  resources?: unknown;
}) {
  const objectiveItems = Array.isArray(objectives) ? objectives.filter((item): item is string => typeof item === "string") : [];
  const resourceItems = list(resources);
  if (!objectiveItems.length && !transcript && !resourceItems.length) return null;

  return (
    <section aria-label="Lesson materials" className="grid gap-4 lg:grid-cols-2">
      {objectiveItems.length > 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="flex items-center gap-2 text-[16px] font-semibold"><Target className="h-4 w-4 text-[var(--accent-2)]" /> Learning objectives</h2>
          <ul className="mt-3 space-y-2 text-[14px] text-[var(--muted)]">
            {objectiveItems.map((objective, index) => <li key={`${objective}-${index}`}>• {objective}</li>)}
          </ul>
        </div>
      )}
      {resourceItems.length > 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="flex items-center gap-2 text-[16px] font-semibold"><LinkIcon className="h-4 w-4 text-[var(--accent-2)]" /> Resources</h2>
          <div className="mt-3 space-y-2">
            {resourceItems.map((resource, index) => {
              const href = resource.url ?? resource.href;
              return href ? <a key={`${href}-${index}`} href={href} target="_blank" rel="noreferrer" className="block rounded-lg px-2 py-1 text-[14px] text-[var(--accent-2)] hover:bg-[var(--surface-2)]">{resource.title ?? resource.type ?? "Open resource"}</a> : <p key={index} className="text-[14px] text-[var(--muted)]">{resource.title ?? resource.type ?? "Course resource"}</p>;
            })}
          </div>
        </div>
      )}
      {transcript && (
        <details className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 lg:col-span-2">
          <summary className="flex cursor-pointer items-center gap-2 text-[16px] font-semibold"><FileText className="h-4 w-4 text-[var(--accent-2)]" /> Transcript</summary>
          <AcademicMarkdown className="mt-4 max-h-96 overflow-y-auto pr-2">{transcript}</AcademicMarkdown>
        </details>
      )}
    </section>
  );
}
