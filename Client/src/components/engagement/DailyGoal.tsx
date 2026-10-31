"use client";

import { ProgressRing } from "./ProgressRing";
import { formatXp } from "@/lib/utils";
import { dailyGoalProgress } from "@/lib/xp";

export function DailyGoal({
  earned,
  goal,
}: {
  earned: number;
  goal: number;
}) {
  const pct = dailyGoalProgress(earned, goal);
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <ProgressRing value={pct} color="var(--xp)" size={72} stroke={7}>
        <span className="text-[14px] text-[var(--xp)]">{Math.round(pct * 100)}%</span>
      </ProgressRing>
      <div>
        <p className="text-[14px] font-semibold">Daily goal</p>
        <p className="text-[14px] text-[var(--muted)]">
          {formatXp(earned)} / {formatXp(goal)} XP
        </p>
      </div>
    </div>
  );
}
