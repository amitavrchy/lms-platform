"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Clock, BookOpen } from "lucide-react";
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
        <p className="mt-3 max-w-xl text-[16px] text-[var(--muted)]">
          Published pathways from your academy — enroll and keep the streak going.
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
                className="h-36 bg-gradient-to-br from-[var(--accent)]/40 via-[var(--surface-2)] to-[var(--accent-2)]/20"
                style={
                  course.coverUrl
                    ? { backgroundImage: `url(${course.coverUrl})`, backgroundSize: "cover" }
                    : undefined
                }
              />
              <div className="p-5">
                <div className="mb-2 flex items-center gap-2">
                  {course.level && <Badge tone="accent">{course.level}</Badge>}
                  <span className="inline-flex items-center gap-1 text-[14px] text-[var(--muted)]">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDuration(course.durationMins || 0)}
                  </span>
                </div>
                <h2 className="text-[18px] font-semibold group-hover:text-[var(--accent-2)] transition-colors">
                  {course.title}
                </h2>
                {course.subtitle && (
                  <p className="mt-2 line-clamp-2 text-[14px] text-[var(--muted)]">{course.subtitle}</p>
                )}
                <p className="mt-4 inline-flex items-center gap-1.5 text-[14px] text-[var(--muted)]">
                  <BookOpen className="h-3.5 w-3.5" />
                  {course._count?.modules ?? 0} modules
                </p>
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
