"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { StreakFlame } from "@/components/engagement/StreakFlame";
import { DailyGoal } from "@/components/engagement/DailyGoal";
import { formatXp } from "@/lib/utils";

type Streak = {
  currentStreak: number;
  longestStreak: number;
  xpTotal: number;
  dailyGoalXp: number;
  dailyXpEarned: number;
  lastActiveDate?: string | null;
};

export default function StreakPage() {
  const { data } = useQuery({
    queryKey: queryKeys.streak,
    queryFn: async () => (await api.get<Streak>("/me/streak")).data,
  });

  const days = Array.from({ length: 35 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (34 - i));
    return d;
  });

  const last = data?.lastActiveDate ? new Date(data.lastActiveDate) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-[family-name:var(--font-display)] text-[32px] font-bold"
      >
        Streak & XP
      </motion.h1>

      <div className="grid gap-4 md:grid-cols-2">
        <StreakFlame
          streak={data?.currentStreak ?? 0}
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
        />
        <DailyGoal earned={data?.dailyXpEarned ?? 0} goal={data?.dailyGoalXp ?? 30} />
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-[14px] text-[var(--muted)]">Lifetime XP</p>
        <p className="font-[family-name:var(--font-display)] text-[36px] font-bold text-[var(--xp)]">
          {formatXp(data?.xpTotal ?? 0)}
        </p>
        <p className="mt-2 text-[14px] text-[var(--muted)]">
          Longest streak: {data?.longestStreak ?? 0} days
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-[16px] font-semibold">Activity heatmap</h2>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {days.map((d) => {
            const active =
              last &&
              d.toDateString() === last.toDateString();
            const inStreak =
              data?.currentStreak &&
              (() => {
                const diff = Math.floor(
                  (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24),
                );
                return diff >= 0 && diff < (data.currentStreak ?? 0);
              })();
            return (
              <motion.div
                key={d.toISOString()}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                title={d.toDateString()}
                className={`aspect-square rounded-lg ${
                  active || inStreak
                    ? "bg-[var(--accent-2)]/70"
                    : "bg-[var(--surface-2)]"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
