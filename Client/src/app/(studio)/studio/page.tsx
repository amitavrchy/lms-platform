"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Layers, Users } from "lucide-react";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { StudioCourseListItem } from "@/components/curriculum/types";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

export default function StudioCoursesPage() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const coursesQuery = useQuery({
    queryKey: queryKeys.studio.courses,
    queryFn: async () => (await api.get<StudioCourseListItem[]>("/studio/courses")).data,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/studio/courses", {
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        subtitle: subtitle.trim() || undefined,
      });
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.studio.courses });
      setTitle("");
      setSlug("");
      setSubtitle("");
      setSlugTouched(false);
    },
  });

  const courses = coursesQuery.data ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-[family-name:var(--font-display)] text-[32px] font-bold tracking-tight"
        >
          Courses
        </motion.h1>
        <p className="mt-2 text-[16px] text-[var(--muted)]">Build curriculum, publish, and iterate.</p>
      </div>

      <form
        className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          createMutation.mutate();
        }}
      >
        <h2 className="text-[18px] font-semibold">Create course</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              placeholder="Intro to TypeScript"
              required
            />
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder="intro-to-typescript"
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="subtitle">Subtitle (optional)</Label>
          <Input
            id="subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="From zero to shipping typesafe apps"
          />
        </div>
        {createMutation.isError && (
          <p className="text-[14px] text-[var(--danger)]">Could not create course. Check the slug is unique.</p>
        )}
        <Button type="submit" disabled={createMutation.isPending || !title.trim() || !slug.trim()}>
          <Plus className="h-4 w-4" />
          {createMutation.isPending ? "Creating…" : "Create course"}
        </Button>
      </form>

      <section className="space-y-3">
        <h2 className="text-[20px] font-semibold">Your courses</h2>
        {coursesQuery.isLoading && <p className="text-[14px] text-[var(--muted)]">Loading…</p>}
        {!coursesQuery.isLoading && courses.length === 0 && (
          <p className="text-[14px] text-[var(--muted)]">No courses yet — create your first above.</p>
        )}
        <div className="space-y-3">
          {courses.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                href={`/studio/courses/${c.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-[color-mix(in_oklab,var(--accent)_40%,var(--border))]"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-[16px] font-semibold">{c.title}</h3>
                    <Badge tone={c.status === "PUBLISHED" ? "success" : "default"}>{c.status}</Badge>
                  </div>
                  {c.subtitle && (
                    <p className="mt-1 line-clamp-1 text-[14px] text-[var(--muted)]">{c.subtitle}</p>
                  )}
                  <div className="mt-2 flex gap-4 text-[14px] text-[var(--muted)]">
                    <span className="inline-flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5" />
                      {c._count?.modules ?? 0} modules
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {c._count?.enrollments ?? 0} enrolled
                    </span>
                  </div>
                </div>
                <span className="shrink-0 text-[14px] text-[var(--accent)]">Edit →</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
