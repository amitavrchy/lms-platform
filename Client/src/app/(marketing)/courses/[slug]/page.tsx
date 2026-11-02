"use client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  PlayCircle,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { editorialFor, type CatalogCourse } from "@/lib/course-content";
import { CourseArt } from "@/components/academic/CourseCard";
import { AcademicMarkdown } from "@/components/academic/AcademicMarkdown";
import { useAppSelector } from "@/store/hooks";
import { formatDuration } from "@/lib/utils";

type Detail = CatalogCourse & {
  descriptionMd?: string;
  enrolled?: boolean;
  modules: {
    id: string;
    title: string;
    lessons: { id: string; title: string; type: string; durationSec: number }[];
  }[];
};
export default function PublicCoursePage() {
  const { slug } = useParams<{ slug: string }>();
  const user = useAppSelector((s) => s.auth.user);
  const router = useRouter();
  const qc = useQueryClient();
  const course = useQuery({
    queryKey: queryKeys.catalog.course(slug),
    queryFn: async () =>
      (await api.get<Detail>(`/catalog/courses/${slug}`)).data,
  });
  const enroll = useMutation({
    mutationFn: async () =>
      api.post("/enrollments", { courseId: course.data?.id }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.enrollments });
      void qc.invalidateQueries({ queryKey: queryKeys.catalog.course(slug) });
      toast.success("You are enrolled. Your next chapter starts now.");
      router.push(`/learn/courses/${slug}`);
    },
    onError: () =>
      toast.error(
        "We could not complete enrollment. Please try again or contact your academy.",
      ),
  });
  if (course.isLoading)
    return (
      <div className="site-container py-20">
        <div className="h-96 animate-pulse rounded-xl bg-[var(--surface-2)]" />
      </div>
    );
  if (!course.data)
    return (
      <div className="site-container py-20">
        <div className="empty-panel">
          <h1 className="text-3xl">This course is unavailable.</h1>
          <p>
            {course.isError
              ? "We could not load this course. Try again or explore the collection."
              : "Explore the collection to find your next step."}
          </p>
          <div className="mt-5 flex gap-5">
            <button className="text-link" onClick={() => void course.refetch()}>
              Try again
            </button>
            <Link href="/courses" className="text-link">
              Back to courses <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </div>
    );
  const data = course.data;
  const info = editorialFor(slug);
  const sameAcademy =
    !user ||
    !data.organization?.slug ||
    data.organization.slug === user.orgSlug;
  const lessons = data.modules.flatMap((m) => m.lessons);
  return (
    <>
      <section className="detail-hero">
        <div className="site-container">
          <Link href="/courses" className="text-link mb-8">
            <ArrowLeft size={16} /> Back to the collection
          </Link>
          <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_.7fr]">
            <div>
              <p className="eyebrow">{info.category.toUpperCase()}</p>
              <h1 className="catalog-title">{data.title}</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
                {data.subtitle}
              </p>
              <div className="mt-7 flex flex-wrap gap-5 text-sm">
                <span className="flex items-center gap-2">
                  <Clock3 size={17} />
                  {formatDuration(data.durationMins)}
                </span>
                <span className="flex items-center gap-2">
                  <BookOpen size={17} />
                  {lessons.length} lessons · {data.modules.length} modules
                </span>
                <span className="flex items-center gap-2">
                  <Award size={17} />
                  Certificate of completion
                </span>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border bg-[var(--surface)]">
              <CourseArt slug={slug} title={data.title} />
              <div className="p-6">
                <p className="text-sm text-[var(--muted)]">
                  {data.enrolled
                    ? "YOUR COURSE IS READY"
                    : "MAKE YOUR NEXT MOVE"}
                </p>
                <p className="mt-2 text-xl font-semibold">
                  {data.enrolled
                    ? "Welcome back to your learning."
                    : "Start with one focused lesson."}
                </p>
                <button
                  className="action-link mt-5 w-full"
                  disabled={enroll.isPending}
                  onClick={() => {
                    if (!user || !sameAcademy) {
                      router.push(
                        `/login?next=${encodeURIComponent(`/courses/${slug}`)}`,
                      );
                      return;
                    }
                    if (data.enrolled) {
                      router.push(`/learn/courses/${slug}`);
                      return;
                    }
                    enroll.mutate();
                  }}
                >
                  {enroll.isPending
                    ? "Enrolling…"
                    : !sameAcademy
                      ? "Sign in to this academy"
                      : data.enrolled
                        ? "Continue learning"
                        : user
                          ? "Enroll free"
                          : "Sign in to enroll"}
                  <ArrowUpRight size={18} />
                </button>
                <p className="mt-4 text-center text-sm text-[var(--muted)]">
                  Lessons, practice, feedback, and a clear path.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="site-container section-space">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_.7fr]">
          <div>
            <p className="eyebrow">THE BIG PICTURE</p>
            <h2 className="section-title">Make the knowledge yours.</h2>
            {data.descriptionMd && (
              <AcademicMarkdown className="mt-6">
                {data.descriptionMd}
              </AcademicMarkdown>
            )}
            <div className="mt-12">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold">
                  Inside the curriculum
                </h2>
                <span className="text-sm text-[var(--muted)]">
                  {lessons.length} lessons · {formatDuration(data.durationMins)}
                </span>
              </div>
              {data.modules.map((mod, i) => (
                <details key={mod.id} className="faq-item" open={i === 0}>
                  <summary>
                    <span>
                      <span className="mr-3 text-sm text-[var(--muted)]">
                        0{i + 1}
                      </span>
                      {mod.title}
                    </span>
                    <span className="faq-plus">+</span>
                  </summary>
                  <ul className="mb-5 space-y-1">
                    {mod.lessons.map((lesson) => (
                      <li
                        key={lesson.id}
                        className="flex items-center gap-3 rounded-lg bg-white p-3 text-sm"
                      >
                        {lesson.type === "VIDEO" ? (
                          <PlayCircle size={17} />
                        ) : (
                          <FileText size={17} />
                        )}
                        <span className="flex-1">{lesson.title}</span>
                        <span className="text-[var(--muted)]">
                          {Math.max(1, Math.round(lesson.durationSec / 60))} min
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </div>
          <aside>
            <div className="rounded-xl border bg-white p-7">
              <p className="eyebrow">WHAT YOU WILL TAKE AWAY</p>
              <h2 className="mt-4 text-2xl font-medium">
                Skills that stay with you.
              </h2>
              <ul className="mt-6 space-y-5">
                {(info.outcomes.length
                  ? info.outcomes
                  : [
                      "Apply the core concepts through guided practice",
                      "Assess your understanding and review feedback",
                      "Build a record of your completed learning",
                    ]
                ).map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-7">
                    <CheckCircle2
                      className="mt-1 shrink-0 text-[#688558]"
                      size={18}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-5 rounded-xl border p-7">
              <h2 className="text-lg font-semibold">
                A good fit for curious learners.
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                {data.level || "All levels"}. Bring a current assignment or
                project to apply each lesson. You can work independently or
                follow the schedule of an assigned cohort.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
