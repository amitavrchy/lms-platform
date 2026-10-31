"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Sparkles, Upload } from "lucide-react";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { StudioCourse, StudioCourseListItem, StudioLesson } from "@/components/curriculum/types";

type LessonOption = StudioLesson & { moduleTitle: string; courseTitle: string };

export default function StudioAiPage() {
  const [courseId, setCourseId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");
  const [ingestText, setIngestText] = useState("");
  const [quizResult, setQuizResult] = useState<unknown>(null);
  const [ingestResult, setIngestResult] = useState<unknown>(null);

  const coursesQuery = useQuery({
    queryKey: queryKeys.studio.courses,
    queryFn: async () => (await api.get<StudioCourseListItem[]>("/studio/courses")).data,
  });

  const courseQuery = useQuery({
    queryKey: queryKeys.studio.course(courseId),
    queryFn: async () => (await api.get<StudioCourse>(`/studio/courses/${courseId}`)).data,
    enabled: !!courseId,
  });

  const lessons: LessonOption[] = useMemo(() => {
    const course = courseQuery.data;
    if (!course) return [];
    return course.modules.flatMap((m) =>
      m.lessons.map((l) => ({
        ...l,
        moduleTitle: m.title,
        courseTitle: course.title,
      })),
    );
  }, [courseQuery.data]);

  const generateQuiz = useMutation({
    mutationFn: async () =>
      (
        await api.post("/ai/quiz-generate", {
          lessonId,
          count,
          difficulty,
        })
      ).data,
    onSuccess: (data) => setQuizResult(data),
  });

  const ingest = useMutation({
    mutationFn: async () =>
      (
        await api.post(`/studio/lessons/${lessonId}/ingest`, {
          text: ingestText.trim() || undefined,
        })
      ).data,
    onSuccess: (data) => setIngestResult(data),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-[family-name:var(--font-display)] text-[32px] font-bold tracking-tight"
        >
          AI tools
        </motion.h1>
        <p className="mt-2 text-[16px] text-[var(--muted)]">
          Generate quiz drafts and ingest lesson content for the tutor.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="course">Course</Label>
          <select
            id="course"
            value={courseId}
            onChange={(e) => {
              setCourseId(e.target.value);
              setLessonId("");
              setQuizResult(null);
              setIngestResult(null);
            }}
            className="flex h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-[14px]"
          >
            <option value="">Select course…</option>
            {(coursesQuery.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="lesson">Lesson</Label>
          <select
            id="lesson"
            value={lessonId}
            onChange={(e) => {
              setLessonId(e.target.value);
              setQuizResult(null);
              setIngestResult(null);
            }}
            disabled={!courseId}
            className="flex h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-[14px] disabled:opacity-50"
          >
            <option value="">Select lesson…</option>
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.moduleTitle} — {l.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <form
        className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!lessonId) return;
          generateQuiz.mutate();
        }}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-[18px] font-semibold">Quiz generate</h2>
          <Badge tone="accent">POST /ai/quiz-generate</Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="count">Question count</Label>
            <Input
              id="count"
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Number(e.target.value) || 5)}
            />
          </div>
          <div>
            <Label htmlFor="diff">Difficulty</Label>
            <select
              id="diff"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-[14px]"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
        {generateQuiz.isError && (
          <p className="text-[14px] text-[var(--danger)]">Generation failed — check AI service.</p>
        )}
        <Button type="submit" disabled={!lessonId || generateQuiz.isPending}>
          <Sparkles className="h-4 w-4" />
          {generateQuiz.isPending ? "Generating…" : "Generate quiz"}
        </Button>
        {quizResult != null && (
          <pre className="max-h-64 overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-[14px]">
            {JSON.stringify(quizResult, null, 2)}
          </pre>
        )}
      </form>

      <form
        className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!lessonId) return;
          ingest.mutate();
        }}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-[18px] font-semibold">Ingest lesson</h2>
          <Badge tone="cyan">POST /studio/lessons/:id/ingest</Badge>
        </div>
        <div>
          <Label htmlFor="ingest">Override text (optional)</Label>
          <textarea
            id="ingest"
            value={ingestText}
            onChange={(e) => setIngestText(e.target.value)}
            rows={5}
            placeholder="Leave blank to use lesson contentMd / title"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[14px] text-[var(--text)] placeholder:text-[var(--muted)] focus-visible:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          />
        </div>
        {ingest.isError && (
          <p className="text-[14px] text-[var(--danger)]">Ingest failed — check AI service.</p>
        )}
        <Button type="submit" variant="secondary" disabled={!lessonId || ingest.isPending}>
          <Upload className="h-4 w-4" />
          {ingest.isPending ? "Ingesting…" : "Trigger ingest"}
        </Button>
        {ingestResult != null && (
          <pre className="max-h-48 overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-[14px]">
            {JSON.stringify(ingestResult, null, 2)}
          </pre>
        )}
      </form>
    </div>
  );
}
