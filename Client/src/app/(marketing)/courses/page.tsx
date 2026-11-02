"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock, BookOpen, Layers3, Users } from "lucide-react";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { formatDuration } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type CatalogCourse = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  coverUrl?: string | null;
  level?: string | null;
  durationMins: number;
  _count?: { modules: number; enrollments: number };
};

const themes = [
  "from-violet-600/80 via-indigo-950 to-cyan-500/35",
  "from-emerald-500/70 via-teal-950 to-sky-500/35",
  "from-orange-500/75 via-rose-950 to-fuchsia-500/30",
  "from-cyan-500/75 via-blue-950 to-violet-500/35",
];

function themeFor(course: CatalogCourse) {
  const source = `${course.slug}-${course.title}`;
  return themes[[...source].reduce((total, char) => total + char.charCodeAt(0), 0) % themes.length];
}

export default function CoursesCatalogPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.catalog.courses,
    queryFn: async () => {
      const { data } = await api.get<CatalogCourse[]>("/catalog/courses");
      return data;
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-[family-name:var(--font-display)] text-[36px] font-bold tracking-tight">
          Course catalog
        </h1>
        <p className="mt-3 max-w-2xl text-[16px] text-[var(--muted)]">
          Structured, instructor-led learning paths. Each course is built from a purposeful sequence of lessons, practice, and assessment.
        </p>
      </motion.div>

      {isLoading && (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-[var(--surface)]" />
          ))}
        </div>
      )}

      {isError && (
        <p className="mt-10 text-[14px] text-[var(--danger)]">
          Could not load catalog. Is the API running on port 4000?
        </p>
      )}

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link
              href={`/learn/courses/${course.slug}`}
              className="group block overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition hover:border-[color-mix(in_oklab,var(--accent)_45%,var(--border))]"
            >
              <div
                className={`relative h-44 overflow-hidden bg-gradient-to-br ${themeFor(course)}`}
                style={
                  course.coverUrl
                    ? { backgroundImage: `url(${course.coverUrl})`, backgroundSize: "cover" }
                    : undefined
                }
              >
                {!course.coverUrl && <><div className="absolute -right-8 -top-12 h-40 w-40 rounded-full border border-white/20" /><div className="absolute bottom-5 left-5 text-[14px] font-semibold uppercase tracking-[0.18em] text-white/80">Learning path</div><div className="absolute bottom-5 right-5 grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-white backdrop-blur"><BookOpen className="h-5 w-5" /></div></>}
              </div>
              <div className="p-5">
                <div className="mb-2 flex items-center gap-2">
                  {course.level && <Badge tone="accent">{course.level}</Badge>}
                  <span className="inline-flex items-center gap-1 text-[14px] text-[var(--muted)]">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDuration(course.durationMins || 0)}
                  </span>
                </div>
                <h2 className="text-[20px] font-semibold group-hover:text-[var(--accent-2)] transition-colors">
                  {course.title}
                </h2>
                {course.subtitle && (
                  <p className="mt-2 line-clamp-2 text-[14px] text-[var(--muted)]">{course.subtitle}</p>
                )}
                <div className="mt-5 grid grid-cols-2 gap-2 border-t border-[var(--border)] pt-4 text-[14px] text-[var(--muted)]"><span className="flex items-center gap-1.5"><Layers3 className="h-4 w-4 text-[var(--accent-2)]" />{course._count?.modules ?? 0} modules</span><span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-[var(--accent-2)]" />{course._count?.enrollments ?? 0} learners</span></div>
                <span className="mt-5 inline-flex items-center gap-1 text-[14px] font-medium text-[var(--text)]">Explore curriculum <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {!isLoading && data?.length === 0 && (
        <p className="mt-10 text-[14px] text-[var(--muted)]">No published courses yet.</p>
      )}
    </div>
  );
}
