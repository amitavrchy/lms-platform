import { LockKeyhole, CalendarClock } from "lucide-react";

export function LockedModuleState({ availableAt }: { availableAt?: string | null }) {
  const date = availableAt ? new Date(availableAt) : null;
  const label = date && !Number.isNaN(date.valueOf())
    ? `Available ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
    : "This module is not released yet";

  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
      <LockKeyhole className="h-4 w-4 text-[var(--muted)]" />
      <div>
        <p className="text-[14px] font-medium">Module locked</p>
        <p className="flex items-center gap-1 text-[14px] text-[var(--muted)]"><CalendarClock className="h-3.5 w-3.5" /> {label}</p>
      </div>
    </div>
  );
}
