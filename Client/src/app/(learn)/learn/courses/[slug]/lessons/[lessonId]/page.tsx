"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ClipboardPenLine, Focus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { setTutorOpen } from "@/features/uiSlice";
import { toggleFocusMode, setPlaybackRate } from "@/features/playerUiSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { CompleteBar } from "@/components/player/CompleteBar";
import { TutorDrawer } from "@/components/ai/TutorDrawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AcademicMarkdown } from "@/components/academic/AcademicMarkdown";
import { LessonResources } from "@/components/academic/LessonResources";
import { DiscussionPanel } from "@/components/academic/DiscussionPanel";

type LessonDetail = {
  id: string;
  title: string;
  slug: string;
  type: string;
  contentMd?: string | null;
  videoUrl?: string | null;
  durationSec: number;
  quiz?: { id: string; title: string } | null;
  navigation?: { id: string; title: string; sortOrder: number }[];
  objectives?: string[];
  transcript?: string | null;
  resources?: unknown[];
  module: {
    id: string;
    title: string;
    course: { id: string; slug: string; title: string };
    lessons: { id: string; title: string; sortOrder: number }[];
  };
};

export default function LessonPlayerPage() {
  const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const qc = useQueryClient();
  const focusMode = useAppSelector((s) => s.playerUi.focusMode);
  const playbackRate = useAppSelector((s) => s.playerUi.playbackRate);
  const lastSaved = useRef(0);
  const [noteDraft, setNoteDraft] = useState<{
    lessonId: string;
    value: string;
  } | null>(null);
  const notes =
    noteDraft?.lessonId === lessonId
      ? noteDraft.value
      : typeof window !== "undefined"
        ? (window.localStorage.getItem(`learnora-notes-${lessonId}`) ?? "")
        : "";

  const lessonQuery = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () =>
      (await api.get<LessonDetail>(`/catalog/lessons/${lessonId}`)).data,
  });

  const progressQuery = useQuery({
    queryKey: queryKeys.lessonProgress(lessonId),
    queryFn: async () => (await api.get(`/progress/${lessonId}`)).data,
  });

  const completeMutation = useMutation({
    mutationFn: async () =>
      (await api.patch(`/progress/${lessonId}`, { completed: true })).data as {
        xp?: { awarded: number };
        certificate?: { code: string } | null;
      },
    onSuccess: (data) => {
      void qc.invalidateQueries({
        queryKey: queryKeys.lessonProgress(lessonId),
      });
      void qc.invalidateQueries({ queryKey: queryKeys.streak });
      void qc.invalidateQueries({ queryKey: queryKeys.enrollments });
      toast.success(
        `Lesson complete${data.xp ? ` · +${data.xp.awarded} XP` : ""}`,
      );
      if (data.certificate) {
        confetti({ particleCount: 120, spread: 0.9, origin: { y: 0.65 } });
        toast.success(`Certificate issued · ${data.certificate.code}`);
      }
    },
    onError: () =>
      toast.error(
        lessonQuery.data?.quiz
          ? "Pass the checkpoint quiz before marking this lesson complete."
          : "Could not update progress",
      ),
  });

  const savePosition = useCallback(
    async (sec: number) => {
      if (Math.abs(sec - lastSaved.current) < 5) return;
      lastSaved.current = sec;
      try {
        await api.patch(`/progress/${lessonId}`, { positionSec: sec });
      } catch {
        /* ignore transient */
      }
    },
    [lessonId],
  );

  const lesson = lessonQuery.data;
  const siblings = useMemo(
    () =>
      lesson?.navigation ??
      (lesson?.module.lessons ?? [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [lesson],
  );
  const idx = siblings.findIndex((l) => l.id === lessonId);
  const next = idx >= 0 ? siblings[idx + 1] : undefined;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key.toLowerCase() === "n" && next) {
        router.push(`/learn/courses/${slug}/lessons/${next.id}`);
      }
      if (e.key.toLowerCase() === "f") {
        dispatch(toggleFocusMode());
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch, next, router, slug]);

  function saveNotes(value: string) {
    setNoteDraft({ lessonId, value });
    window.localStorage.setItem(`learnora-notes-${lessonId}`, value);
  }

  if (lessonQuery.isLoading) {
    return (
      <div className="h-96 animate-pulse rounded-2xl bg-[var(--surface)]" />
    );
  }

  if (!lesson)
    return (
      <div className="empty-panel">
        <h1 className="text-2xl font-semibold">
          This lesson is not available yet.
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          Check your enrollment and cohort release schedule, or return to the
          course outline.
        </p>
        <Button
          className="mt-5"
          onClick={() => router.push(`/learn/courses/${slug}`)}
        >
          Back to course
        </Button>
      </div>
    );
  const completed = Boolean(
    progressQuery.data?.completed ?? progressQuery.data?.progress?.completed,
  );

  return (
    <div className={focusMode ? "mx-auto max-w-5xl" : "mx-auto max-w-5xl"}>
      {focusMode && (
        <div className="mb-4 flex justify-end">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => dispatch(toggleFocusMode())}
          >
            <Focus size={16} />
            Exit focus mode
          </Button>
        </div>
      )}
      {!focusMode && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <p className="text-[14px] text-[var(--muted)]">
            {lesson.module.course.title} · {lesson.module.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="font-[family-name:var(--font-display)] text-[28px] font-bold tracking-tight">
              {lesson.title}
            </h1>
            <Badge>{lesson.type}</Badge>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {lesson.type === "VIDEO" && lesson.videoUrl ? (
          <VideoPlayer
            src={lesson.videoUrl}
            initialPosition={progressQuery.data?.positionSec ?? 0}
            onProgress={savePosition}
          />
        ) : (
          <article className="max-w-none rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <AcademicMarkdown>
              {lesson.contentMd || "_No content yet._"}
            </AcademicMarkdown>
          </article>
        )}

        {!focusMode && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => dispatch(setTutorOpen(true))}
            >
              <Sparkles className="h-4 w-4" />
              AI Tutor
              <kbd className="ml-1 rounded bg-[var(--surface-2)] px-1.5 text-[14px]">
                A
              </kbd>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(toggleFocusMode())}
            >
              <Focus className="h-4 w-4" />
              Focus
            </Button>
            <span
              className="text-[14px] text-[var(--muted)]"
              aria-label="Keyboard shortcuts"
            >
              Shortcuts: A tutor · F focus · N next
            </span>
            {[0.75, 1, 1.25, 1.5, 2].map((r) => (
              <Button
                key={r}
                size="sm"
                variant={playbackRate === r ? "secondary" : "ghost"}
                onClick={() => dispatch(setPlaybackRate(r))}
              >
                {r}x
              </Button>
            ))}
            {lesson.quiz && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/learn/quiz/${lesson.quiz!.id}`)}
              >
                Take quiz
              </Button>
            )}
          </div>
        )}

        <CompleteBar
          completed={completed}
          completing={completeMutation.isPending}
          onComplete={() => completeMutation.mutate()}
          hasNext={Boolean(next)}
          onNext={() =>
            next && router.push(`/learn/courses/${slug}/lessons/${next.id}`)
          }
        />
        {!focusMode && (
          <section className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
            <LessonResources
              objectives={lesson.objectives}
              transcript={lesson.transcript}
              resources={lesson.resources}
            />
            <aside className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="flex items-center gap-2 text-[16px] font-semibold">
                <ClipboardPenLine className="h-4 w-4 text-[var(--accent-2)]" />{" "}
                Study notes
              </h2>
              <p className="mt-1 text-[14px] text-[var(--muted)]">
                Private to this browser · capture an idea before you move on.
              </p>
              <label className="sr-only" htmlFor="lesson-notes">
                Notes for {lesson.title}
              </label>
              <textarea
                id="lesson-notes"
                value={notes}
                onChange={(event) => saveNotes(event.target.value)}
                placeholder="What is worth remembering?"
                className="mt-4 min-h-36 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-[14px] text-[var(--text)] placeholder:text-[var(--muted)]"
              />
            </aside>
          </section>
        )}
        {!focusMode && (
          <DiscussionPanel
            courseId={lesson.module.course.id}
            lessonId={lessonId}
          />
        )}
      </div>

      <TutorDrawer key={lessonId} lessonId={lessonId} />
    </div>
  );
}
