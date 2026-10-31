"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from "recharts";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { StudioCourseListItem } from "@/components/curriculum/types";

type CourseAnalytics = {
  courseId: string;
  title: string;
  enrollments: number;
  completions: number;
  completionRate: number;
  lessonCompletion: {
    lessonId: string;
    title: string;
    moduleTitle: string;
    completedCount: number;
    rate: number;
  }[];
  quizStats: {
    quizId: string;
    attempts: number;
    avgScore: number;
    passRate: number;
  }[];
};

type InsightsPayload = {
  insights?: string[] | { text?: string; title?: string }[];
  summary?: string;
  recommendations?: string[];
  [key: string]: unknown;
};

function insightLines(data: InsightsPayload | undefined): string[] {
  if (!data) return [];
  if (typeof data.summary === "string" && data.summary) return [data.summary];
  if (Array.isArray(data.insights)) {
    return data.insights.map((i) => (typeof i === "string" ? i : i.text || i.title || JSON.stringify(i)));
  }
  if (Array.isArray(data.recommendations)) return data.recommendations;
  if (typeof data === "object") {
    const nested = (data as { data?: InsightsPayload }).data;
    if (nested) return insightLines(nested);
  }
  return [];
}

export default function StudioAnalyticsPage() {
  const [courseId, setCourseId] = useState("");

  const coursesQuery = useQuery({
    queryKey: queryKeys.studio.courses,
    queryFn: async () => (await api.get<StudioCourseListItem[]>("/studio/courses")).data,
  });

  const analyticsQuery = useQuery({
    queryKey: queryKeys.studio.analytics(courseId),
    queryFn: async () => (await api.get<CourseAnalytics>(`/analytics/course/${courseId}`)).data,
    enabled: !!courseId,
  });

  const insightsQuery = useQuery({
    queryKey: queryKeys.studio.insights(courseId),
    queryFn: async () => (await api.get<InsightsPayload>(`/ai/insights/${courseId}`)).data,
    enabled: !!courseId,
  });

  const lessonChart = useMemo(() => {
    const rows = analyticsQuery.data?.lessonCompletion ?? [];
    return rows.map((r) => ({
      name: r.title.length > 18 ? `${r.title.slice(0, 16)}…` : r.title,
      full: r.title,
      rate: Math.round(r.rate * 100),
      completed: r.completedCount,
    }));
  }, [analyticsQuery.data]);

  const quizChart = useMemo(() => {
    const rows = analyticsQuery.data?.quizStats ?? [];
    return rows.map((r, i) => ({
      name: `Quiz ${i + 1}`,
      avgScore: Math.round(r.avgScore),
      passRate: Math.round(r.passRate * 100),
      attempts: r.attempts,
    }));
  }, [analyticsQuery.data]);

  const insights = insightLines(insightsQuery.data);
  const stats = analyticsQuery.data;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-[family-name:var(--font-display)] text-[32px] font-bold tracking-tight"
        >
          Analytics
        </motion.h1>
        <p className="mt-2 text-[16px] text-[var(--muted)]">Completion funnels and AI insights per course.</p>
      </div>

      <div className="max-w-md">
        <Label htmlFor="course">Course</Label>
        <select
          id="course"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="flex h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-[14px] text-[var(--text)]"
        >
          <option value="">Select a course…</option>
          {(coursesQuery.data ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {!courseId && (
        <p className="text-[14px] text-[var(--muted)]">Pick a course to load charts and insights.</p>
      )}

      {courseId && analyticsQuery.isLoading && (
        <p className="text-[14px] text-[var(--muted)]">Loading analytics…</p>
      )}

      {stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Enrollments", value: stats.enrollments },
              { label: "Completions", value: stats.completions },
              { label: "Completion rate", value: `${Math.round(stats.completionRate * 100)}%` },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <p className="text-[14px] text-[var(--muted)]">{s.label}</p>
                <p className="mt-1 font-[family-name:var(--font-display)] text-[28px] font-bold">
                  {s.value}
                </p>
              </motion.div>
            ))}
          </div>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="mb-4 text-[18px] font-semibold">Lesson completion rate</h2>
            {lessonChart.length === 0 ? (
              <p className="text-[14px] text-[var(--muted)]">No lesson data yet.</p>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={lessonChart} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 12 }} />
                    <YAxis unit="%" tick={{ fill: "var(--muted)", fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        fontSize: 14,
                      }}
                      formatter={(value) => [`${value}%`, "Completion"]}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.full ?? ""}
                    />
                    <Bar dataKey="rate" fill="var(--accent)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="mb-4 text-[18px] font-semibold">Quiz performance</h2>
            {quizChart.length === 0 ? (
              <p className="text-[14px] text-[var(--muted)]">No quiz attempts yet.</p>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={quizChart} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 12 }} />
                    <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        fontSize: 14,
                      }}
                    />
                    <Line type="monotone" dataKey="avgScore" stroke="var(--accent)" strokeWidth={2} name="Avg score" />
                    <Line type="monotone" dataKey="passRate" stroke="var(--accent-2)" strokeWidth={2} name="Pass %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>
        </>
      )}

      {courseId && (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-[18px] font-semibold">AI insights</h2>
            <Badge tone="accent">AI</Badge>
          </div>
          {insightsQuery.isLoading && <p className="text-[14px] text-[var(--muted)]">Generating insights…</p>}
          {insightsQuery.isError && (
            <p className="text-[14px] text-[var(--danger)]">Insights unavailable — AI service may be offline.</p>
          )}
          {insights.length > 0 ? (
            <ul className="space-y-2">
              {insights.map((line, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[14px]"
                >
                  {line}
                </motion.li>
              ))}
            </ul>
          ) : (
            !insightsQuery.isLoading &&
            !insightsQuery.isError && (
              <p className="text-[14px] text-[var(--muted)]">No insight text returned.</p>
            )
          )}
        </section>
      )}
    </div>
  );
}
