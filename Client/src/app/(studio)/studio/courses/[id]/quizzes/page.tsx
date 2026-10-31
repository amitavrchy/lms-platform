"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { StudioCourse, StudioLesson } from "@/components/curriculum/types";

type LessonOption = StudioLesson & { moduleTitle: string };

export default function StudioQuizzesPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const qc = useQueryClient();
  const [lessonId, setLessonId] = useState("");
  const [title, setTitle] = useState("");
  const [passScore, setPassScore] = useState(70);

  const courseQuery = useQuery({
    queryKey: queryKeys.studio.course(id),
    queryFn: async () => (await api.get<StudioCourse>(`/studio/courses/${id}`)).data,
  });

  const lessons: LessonOption[] = useMemo(() => {
    const course = courseQuery.data;
    if (!course) return [];
    return course.modules.flatMap((m) =>
      m.lessons.map((l) => ({ ...l, moduleTitle: m.title })),
    );
  }, [courseQuery.data]);

  const createQuiz = useMutation({
    mutationFn: async () =>
      (
        await api.post("/quizzes", {
          lessonId,
          title: title.trim(),
          passScore,
          questions: [
            {
              promptMd: "Sample question — replace me",
              options: [
                { id: "a", text: "Option A", correct: true },
                { id: "b", text: "Option B", correct: false },
              ],
            },
          ],
        })
      ).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.studio.course(id) });
      setTitle("");
      setLessonId("");
    },
  });

  const course = courseQuery.data;
  const withQuiz = lessons.filter((l) => l.quiz);
  const withoutQuiz = lessons.filter((l) => !l.quiz);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link
          href={`/studio/courses/${id}`}
          className="mb-3 inline-flex items-center gap-1 text-[14px] text-[var(--muted)] hover:text-[var(--text)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Curriculum
        </Link>
        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-[family-name:var(--font-display)] text-[28px] font-bold"
        >
          Quizzes
        </motion.h1>
        <p className="mt-2 text-[16px] text-[var(--muted)]">
          {course?.title ?? "Course"} — one quiz per lesson
        </p>
      </div>

      <form
        className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!lessonId || !title.trim()) return;
          createQuiz.mutate();
        }}
      >
        <h2 className="text-[18px] font-semibold">Create quiz</h2>
        <div>
          <Label htmlFor="lesson">Lesson</Label>
          <select
            id="lesson"
            value={lessonId}
            onChange={(e) => setLessonId(e.target.value)}
            className="flex h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-[14px] text-[var(--text)]"
            required
          >
            <option value="">Select a lesson without a quiz…</option>
            {withoutQuiz.map((l) => (
              <option key={l.id} value={l.id}>
                {l.moduleTitle} — {l.title}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="qtitle">Title</Label>
            <Input
              id="qtitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Module 1 check-in"
              required
            />
          </div>
          <div>
            <Label htmlFor="pass">Pass score %</Label>
            <Input
              id="pass"
              type="number"
              min={1}
              max={100}
              value={passScore}
              onChange={(e) => setPassScore(Number(e.target.value) || 70)}
            />
          </div>
        </div>
        {createQuiz.isError && (
          <p className="text-[14px] text-[var(--danger)]">
            Could not create quiz. Lesson may already have one.
          </p>
        )}
        <Button type="submit" disabled={createQuiz.isPending || !lessonId || !title.trim()}>
          <Plus className="h-4 w-4" />
          {createQuiz.isPending ? "Creating…" : "Create quiz"}
        </Button>
      </form>

      <section className="space-y-3">
        <h2 className="text-[20px] font-semibold">Existing quizzes</h2>
        {courseQuery.isLoading && <p className="text-[14px] text-[var(--muted)]">Loading…</p>}
        {withQuiz.length === 0 && !courseQuery.isLoading && (
          <p className="text-[14px] text-[var(--muted)]">No quizzes yet.</p>
        )}
        <div className="space-y-2">
          {withQuiz.map((l, i) => (
            <motion.div
              key={l.quiz!.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-[15px] font-medium">{l.quiz!.title}</p>
                <p className="text-[14px] text-[var(--muted)]">
                  {l.moduleTitle} · {l.title}
                </p>
              </div>
              <Badge tone="accent">Attached</Badge>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
