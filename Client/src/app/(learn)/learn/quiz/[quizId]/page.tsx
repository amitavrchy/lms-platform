"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type QuizQ = {
  id: string;
  type: string;
  promptMd: string;
  options: { id: string; text: string }[];
};

type Quiz = {
  id: string;
  title: string;
  passScore: number;
  lessonId: string;
  questions: QuizQ[];
};

export default function QuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    breakdown: { questionId: string; correct: boolean; explanationMd: string | null }[];
    xp?: { awarded: number } | null;
  } | null>(null);

  const quizQuery = useQuery({
    queryKey: queryKeys.quiz(quizId),
    queryFn: async () => (await api.get<Quiz>(`/quizzes/${quizId}`)).data,
  });

  const submit = useMutation({
    mutationFn: async () =>
      (
        await api.post(`/quizzes/${quizId}/attempts`, { answers })
      ).data as typeof result,
    onSuccess: (data) => {
      setResult(data);
      void qc.invalidateQueries({ queryKey: queryKeys.streak });
      if (data?.passed) {
        confetti({ particleCount: 90, spread: 0.8, origin: { y: 0.7 } });
        toast.success(`Passed · +${data.xp?.awarded ?? 25} XP`);
      } else {
        toast.message(`Score ${data?.score}% — keep going`);
      }
    },
    onError: () => toast.error("Submit failed"),
  });

  const quiz = quizQuery.data;

  if (quizQuery.isLoading || !quiz) {
    return <div className="h-64 animate-pulse rounded-2xl bg-[var(--surface)]" />;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Badge tone="accent">Quiz</Badge>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-[28px] font-bold">
          {quiz.title}
        </h1>
        <p className="mt-2 text-[14px] text-[var(--muted)]">Pass score: {quiz.passScore}%</p>
      </motion.div>

      <div className="mt-8 space-y-6">
        {quiz.questions.map((q, i) => {
          const breakdown = result?.breakdown.find((b) => b.questionId === q.id);
          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <p className="text-[15px] font-medium">
                {i + 1}. {q.promptMd}
              </p>
              <div className="mt-4 space-y-2">
                {q.options.map((opt) => {
                  const selected = answers[q.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={Boolean(result)}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt.id }))}
                      className={cn(
                        "flex w-full items-center rounded-xl border px-4 py-3 text-left text-[14px] transition",
                        selected
                          ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_16%,transparent)]"
                          : "border-[var(--border)] hover:bg-[var(--surface-2)]",
                        breakdown &&
                          selected &&
                          (breakdown.correct
                            ? "border-[var(--success)] bg-[color-mix(in_oklab,var(--success)_14%,transparent)]"
                            : "border-[var(--danger)] bg-[color-mix(in_oklab,var(--danger)_14%,transparent)]"),
                      )}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>
              <AnimatePresence>
                {breakdown?.explanationMd && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 text-[14px] text-[var(--muted)]"
                  >
                    {breakdown.explanationMd}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {!result ? (
          <Button
            onClick={() => submit.mutate()}
            disabled={submit.isPending || Object.keys(answers).length < quiz.questions.length}
          >
            {submit.isPending ? "Grading…" : "Submit answers"}
          </Button>
        ) : (
          <>
            <Badge tone={result.passed ? "success" : "danger"}>
              {result.passed ? "Passed" : "Not passed"} · {result.score}%
            </Badge>
            <Button variant="secondary" onClick={() => router.back()}>
              Back to lesson
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
