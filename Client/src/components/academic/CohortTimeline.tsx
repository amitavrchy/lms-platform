import { CalendarDays, Clock3, Users } from "lucide-react";

type Session = { id?: string; title?: string; startsAt?: string; date?: string; duration?: string; facilitator?: string; type?: string };

function sessions(data: unknown): Session[] {
  if (Array.isArray(data)) return data.filter((item): item is Session => Boolean(item && typeof item === "object"));
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    return sessions(record.sessions ?? record.timeline ?? record.events ?? record.items);
  }
  return [];
}

export function CohortTimeline({ cohort }: { cohort?: unknown }) {
  const items = sessions(cohort).slice(0, 5);
  const cohortName = cohort && typeof cohort === "object" ? (cohort as Record<string, unknown>).name : undefined;
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-semibold">Cohort timeline</h2>
          <p className="mt-1 text-[14px] text-[var(--muted)]">{typeof cohortName === "string" ? cohortName : "Your upcoming learning sessions"}</p>
        </div>
        <Users className="h-5 w-5 text-[var(--accent-2)]" />
      </div>
      {items.length ? (
        <ol className="mt-5 space-y-4 border-l border-[var(--border)] pl-4">
          {items.map((session, index) => {
            const when = session.startsAt ?? session.date;
            const date = when ? new Date(when) : null;
            return (
              <li key={session.id ?? `${session.title}-${index}`} className="relative">
                <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--accent)] ring-4 ring-[var(--surface)]" />
                <p className="text-[14px] font-medium">{session.title ?? session.type ?? "Cohort session"}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-[var(--muted)]">
                  <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{date && !Number.isNaN(date.valueOf()) ? date.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "Date to be confirmed"}</span>
                  {(session.duration || session.facilitator) && <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{session.duration ?? session.facilitator}</span>}
                </p>
              </li>
            );
          })}
        </ol>
      ) : <p className="mt-5 text-[14px] text-[var(--muted)]">No scheduled sessions yet. Check back as your cohort calendar is published.</p>}
    </section>
  );
}
