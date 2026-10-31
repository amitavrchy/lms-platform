"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Play, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { useAppSelector } from "@/store/hooks";
import { DailyGoal } from "@/components/engagement/DailyGoal";
import { StreakFlame } from "@/components/engagement/StreakFlame";
import { ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatXp } from "@/lib/utils";

type Streak = {
  currentStreak: number;
  longestStreak: number;
  xpTotal: number;
  dailyGoalXp: number;
  dailyXpEarned: number;
};

type Enrollment = {
  id: string;
  status: string;
  progressPercent?: number;
  course: {
    id: string;
    slug: string;
    title: string;
    subtitle?: string | null;
    coverUrl?: string | null;
  };
  continueLesson?: { id: string; title: string; slug: string } | null;
};

export default function LearnHomePage() {
  const user = useAppSelector((s) => s.auth.user);

  const streakQuery = useQuery({
    queryKey: queryKeys.streak,
    queryFn: async () => (await api.get<Streak>("/me/streak")).data,
    enabled: !!user,
  });

  const enrollmentsQuery = useQuery({
    queryKey: queryKeys.enrollments,
    queryFn: async () => (await api.get<Enrollment[]>("/enrollments/me")).data,
    enabled: !!user,
  });

  const streak = streakQuery.data;
  const enrollments = enrollmentsQuery.data ?? [];
  const continueItem = enrollments.find((e) => e.status === "ACTIVE");

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-[family-name:var(--font-display)] text-[32px] font-bold tracking-tight"
        >
          Hey {user?.name?.split(" ")[0] ?? "learner"}
        </motion.h1>
        <p className="mt-2 text-[16px] text-[var(--muted)]">Finish what you start — one lesson at a time.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StreakFlame streak={streak?.currentStreak ?? 0} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4" />
        <DailyGoal earned={streak?.dailyXpEarned ?? 0} goal={streak?.dailyGoalXp ?? 30} />
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[14px] text-[var(--muted)]">Total XP</p>
            <p className="font-[family-name:var(--font-display)] text-[28px] font-bold text-[var(--xp)]">
              {formatXp(streak?.xpTotal ?? 0)}
            </p>
          </div>
          <Badge tone="xp">Longest {streak?.longestStreak ?? 0}d</Badge>
        </div>
      </div>

      {continueItem && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-[color-mix(in_oklab,var(--accent)_12%,var(--surface))]"
        >
          <div className="p-6">
            <p className="text-[14px] font-medium text-[var(--accent-2)]">Continue learning</p>
            <h2 className="mt-2 text-[22px] font-semibold">{continueItem.course.title}</h2>
            {continueItem.continueLesson && (
              <p className="mt-1 text-[14px] text-[var(--muted)]">Next: {continueItem.continueLesson.title}</p>
            )}
            <div className="mt-4">
              <ProgressBar value={continueItem.progressPercent ?? 0} />
              <p className="mt-2 text-[14px] text-[var(--muted)]">{continueItem.progressPercent ?? 0}% complete</p>
            </div>
            <Link
              href={
                continueItem.continueLesson
                  ? `/learn/courses/${continueItem.course.slug}/lessons/${continueItem.continueLesson.id}`
                  : `/learn/courses/${continueItem.course.slug}`
              }
              className="mt-5 inline-block"
            >
              <Button>
                <Play className="h-4 w-4" />
                Resume
              </Button>
            </Link>
          </div>
        </motion.section>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[20px] font-semibold">Your courses</h2>
          <Link href="/courses" className="inline-flex items-center gap-1 text-[14px] text-[var(--accent-2)]">
            Browse catalog <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {enrollments.map((e, i) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/learn/courses/${e.course.slug}`}
                className="block rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:border-[color-mix(in_oklab,var(--accent)_40%,var(--border))]"
              >
                <h3 className="text-[16px] font-semibold">{e.course.title}</h3>
                {e.course.subtitle && (
                  <p className="mt-1 line-clamp-2 text-[14px] text-[var(--muted)]">{e.course.subtitle}</p>
                )}
                <div className="mt-4">
                  <ProgressBar value={e.progressPercent ?? 0} />
                </div>
              </Link>
            </motion.div>
          ))}
          {!enrollmentsQuery.isLoading && enrollments.length === 0 && (
            <p className="text-[14px] text-[var(--muted)]">No enrollments yet — pick a course from the catalog.</p>
          )}
        </div>
      </section>
    </div>
  );
}
