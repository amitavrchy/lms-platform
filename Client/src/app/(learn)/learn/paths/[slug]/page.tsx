"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Path = {
  id: string;
  slug: string;
  title: string;
  descriptionMd?: string | null;
  courseIds: string[];
};

type CatalogCourse = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  level?: string | null;
};

export default function LearningPathPage() {
  const { slug } = useParams<{ slug: string }>();

  const pathQuery = useQuery({
    queryKey: queryKeys.catalog.path(slug),
    queryFn: async () => {
      const paths = (await api.get<Path[]>("/catalog/paths")).data;
      const found = paths.find((p) => p.slug === slug);
      if (!found) throw new Error("not found");
      return found;
    },
  });

  const coursesQuery = useQuery({
    queryKey: queryKeys.catalog.courses,
    queryFn: async () => (await api.get<CatalogCourse[]>("/catalog/courses")).data,
  });

  const path = pathQuery.data;
  const ordered =
    path?.courseIds
      .map((id) => coursesQuery.data?.find((c) => c.id === id))
      .filter(Boolean) ?? [];

  if (pathQuery.isLoading) {
    return <div className="h-48 animate-pulse rounded-2xl bg-[var(--surface)]" />;
  }

  if (!path) {
    return <p className="text-[14px] text-[var(--danger)]">Path not found.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Badge tone="cyan">Learning path</Badge>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-[32px] font-bold">
          {path.title}
        </h1>
        {path.descriptionMd && (
          <p className="mt-2 text-[16px] text-[var(--muted)]">{path.descriptionMd}</p>
        )}
      </motion.div>

      <ol className="mt-8 space-y-4">
        {ordered.map((course, i) =>
          course ? (
            <motion.li
              key={course.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] text-[14px] font-semibold">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-[16px] font-semibold">{course.title}</h2>
                {course.subtitle && (
                  <p className="truncate text-[14px] text-[var(--muted)]">{course.subtitle}</p>
                )}
              </div>
              <Link href={`/learn/courses/${course.slug}`}>
                <Button size="sm">Open</Button>
              </Link>
            </motion.li>
          ) : null,
        )}
      </ol>
    </div>
  );
}
