"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock3, FileCheck2, Play, Trophy } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { CourseOutcomes } from "@/components/academic/CourseOutcomes";
import { LockedModuleState } from "@/components/academic/LockedModuleState";
import { CohortTimeline } from "@/components/academic/CohortTimeline";

type Lesson = {
  id: string;
  title: string;
  slug: string;
  type: string;
  durationSec: number;
  completed?: boolean;
};

type Module = {
  id: string;
  title: string;
  sortOrder: number;
  lessons: Lesson[];
  locked?: boolean;
  isLocked?: boolean;
  availableAt?: string | null;
  releaseAt?: string | null;
};

type CourseDetail = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  descriptionMd?: string | null;
  level?: string | null;
  durationMins: number;
  enrolled?: boolean;
  progressPercent?: number;
  modules: Module[];
  outcomes?: string[];
  learningOutcomes?: string[];
};

export default function CourseOutlinePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: course, isLoading } = useQuery({
    queryKey: queryKeys.catalog.course(slug),
    queryFn: async () => (await api.get<CourseDetail>(`/catalog/courses/${slug}`)).data,
  });
  const entitlementQuery = useQuery({
    queryKey: ["commerce", "course-status", slug],
    queryFn: async () => (await api.get(`/commerce/courses/${course?.id}/status`)).data,
    enabled: Boolean(course?.id),
    retry: false,
  });

  const enroll = useMutation({
    mutationFn: async () => {
      if (!course) return;
      await api.post("/enrollments", { courseId: course.id });
    },
    onSuccess: () => {
      toast.success("Enrolled — streak awaits");
      void qc.invalidateQueries({ queryKey: queryKeys.catalog.course(slug) });
      void qc.invalidateQueries({ queryKey: queryKeys.enrollments });
    },
    onError: () => toast.error("Could not enroll"),
  });
  const checkout = useMutation({
    mutationFn: async () => (await api.post("/commerce/checkout", { courseId: course?.id })).data,
    onSuccess: (data) => {
      const url = data && typeof data === "object" ? (data as Record<string, unknown>).url ?? (data as Record<string, unknown>).checkoutUrl : undefined;
      if (typeof url === "string") window.location.assign(url);
      else toast.message("Checkout is being configured for this course.");
    },
    onError: () => toast.error("Checkout is unavailable right now"),
  });

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-[var(--surface)]" />;
  }
  if (!course) return <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-[14px] text-[var(--muted)]">This course is unavailable. Return to the catalog to choose another learning path.</div>;

  const firstLesson = course.modules.flatMap((m) => m.lessons)[0];
  const lessonCount = course.modules.reduce((count, module) => count + module.lessons.length, 0);
  const entitlement = entitlementQuery.data && typeof entitlementQuery.data === "object" ? entitlementQuery.data as Record<string, unknown> : {};
  const status = typeof entitlement.status === "string" ? entitlement.status : course.enrolled ? "Active enrollment" : "Enrollment required";

  return (
    <div className="mx-auto max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-3 flex flex-wrap gap-2">
          {course.level && <Badge tone="accent">{course.level}</Badge>}
          <Badge>{course.durationMins} mins</Badge>
        </div>
        <div className="rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[color-mix(in_oklab,var(--accent)_18%,var(--surface))] via-[var(--surface)] to-[color-mix(in_oklab,var(--accent-2)_12%,var(--surface))] p-6 sm:p-8"><h1 className="font-[family-name:var(--font-display)] text-[32px] font-bold tracking-tight">
          {course.title}
        </h1>
        {course.subtitle && <p className="mt-2 text-[16px] text-[var(--muted)]">{course.subtitle}</p>}
        {course.enrolled && (
          <div className="mt-4">
            <ProgressBar value={course.progressPercent ?? 0} />
            <p className="mt-2 text-[14px] text-[var(--muted)]">{course.progressPercent ?? 0}% complete</p>
          </div>
        )}
        <div className="mt-5 grid gap-3 text-[14px] text-[var(--muted)] sm:grid-cols-3"><span className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[var(--accent-2)]" />{course.durationMins} minutes of focused study</span><span className="flex items-center gap-2"><FileCheck2 className="h-4 w-4 text-[var(--accent-2)]" />{lessonCount} lessons across {course.modules.length} modules</span><span className="flex items-center gap-2"><Trophy className="h-4 w-4 text-[var(--accent-2)]" />Progress and assessment tracked</span></div>
        <p className="mt-4 text-[14px] text-[var(--muted)]">Course access: <span className="font-medium text-[var(--text)]">{status}</span></p>
        <div className="mt-6 flex flex-wrap gap-3">
          {course.enrolled ? (
            firstLesson && (
              <Button
                onClick={() =>
                  router.push(`/learn/courses/${course.slug}/lessons/${firstLesson.id}`)
                }
              >
                <Play className="h-4 w-4" />
                Continue
              </Button>
            )
          ) : (
            <>
              <Button onClick={() => enroll.mutate()} disabled={enroll.isPending}>{enroll.isPending ? "Enrolling…" : "Enroll free"}</Button>
              {Boolean(entitlement.requiresPurchase ?? entitlement.purchasable) && <Button variant="secondary" onClick={() => checkout.mutate()} disabled={checkout.isPending}>{checkout.isPending ? "Opening checkout…" : "Get access"}</Button>}
            </>
          )}
        </div></div>
      </motion.div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
        {course.modules
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((mod, mi) => {
            const locked = Boolean(mod.locked ?? mod.isLocked);
            return (
            <motion.section
              key={mod.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mi * 0.05 }}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <div className="flex items-center justify-between gap-3"><h2 className="text-[16px] font-semibold">
                Module {mi + 1}: {mod.title}
              </h2><span className="text-[14px] text-[var(--muted)]">{mod.lessons.length} lesson{mod.lessons.length === 1 ? "" : "s"}</span></div>
              {locked ? <LockedModuleState availableAt={mod.availableAt ?? mod.releaseAt} /> : <ul className="mt-4 space-y-2">
                {mod.lessons
                  .slice()
                  .sort((a, b) => 0)
                  .map((lesson) => (
                    <li key={lesson.id}>
                      <Link
                        href={
                          course.enrolled
                            ? `/learn/courses/${course.slug}/lessons/${lesson.id}`
                            : "#"
                        }
                        onClick={(e) => {
                          if (!course.enrolled) {
                            e.preventDefault();
                            toast.message("Enroll to open lessons");
                          }
                        }}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition hover:bg-[var(--surface-2)]"
                      >
                        {lesson.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                        ) : (
                          <Circle className="h-4 w-4 text-[var(--muted)]" />
                        )}
                        <span className="flex-1">{lesson.title}</span>
                        <span className="hidden text-[14px] text-[var(--muted)] sm:inline">{Math.max(1, Math.round(lesson.durationSec / 60))} min</span><Badge tone="default">{lesson.type}</Badge>
                      </Link>
                    </li>
                  ))}
              </ul>}
            </motion.section>
          );})}
        </div>
        <aside className="space-y-4">
          <CourseOutcomes outcomes={course.outcomes ?? course.learningOutcomes} />
          <CohortTimeline />
        </aside>
      </div>
    </div>
  );
}
