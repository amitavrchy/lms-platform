"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ArrowLeft, FileQuestion, Plus, Rocket } from "lucide-react";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ModuleBlock, slugify } from "@/components/curriculum/ModuleBlock";
import type { StudioCourse } from "@/components/curriculum/types";

export default function CurriculumBuilderPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const qc = useQueryClient();
  const [moduleTitle, setModuleTitle] = useState("");

  const courseQuery = useQuery({
    queryKey: queryKeys.studio.course(id),
    queryFn: async () => (await api.get<StudioCourse>(`/studio/courses/${id}`)).data,
  });

  const invalidate = () => void qc.invalidateQueries({ queryKey: queryKeys.studio.course(id) });

  const addModule = useMutation({
    mutationFn: async (title: string) =>
      (await api.post(`/studio/courses/${id}/modules`, { title })).data,
    onSuccess: () => {
      setModuleTitle("");
      invalidate();
    },
  });

  const renameModule = useMutation({
    mutationFn: async ({ moduleId, title }: { moduleId: string; title: string }) =>
      (await api.patch(`/studio/modules/${moduleId}`, { title })).data,
    onSuccess: invalidate,
  });

  const deleteModule = useMutation({
    mutationFn: async (moduleId: string) =>
      (await api.delete(`/studio/modules/${moduleId}`)).data,
    onSuccess: invalidate,
  });

  const addLesson = useMutation({
    mutationFn: async ({ moduleId, title }: { moduleId: string; title: string }) =>
      (
        await api.post(`/studio/modules/${moduleId}/lessons`, {
          title,
          slug: `${slugify(title)}-${Date.now().toString(36).slice(-4)}`,
        })
      ).data,
    onSuccess: invalidate,
  });

  const renameLesson = useMutation({
    mutationFn: async ({ lessonId, title }: { lessonId: string; title: string }) =>
      (await api.patch(`/studio/lessons/${lessonId}`, { title })).data,
    onSuccess: invalidate,
  });

  const deleteLesson = useMutation({
    mutationFn: async (lessonId: string) =>
      (await api.delete(`/studio/lessons/${lessonId}`)).data,
    onSuccess: invalidate,
  });

  const reorderModules = useMutation({
    mutationFn: async (orderedIds: string[]) =>
      (await api.post(`/studio/courses/${id}/modules/reorder`, { orderedIds })).data,
    onSuccess: (data: StudioCourse) => {
      qc.setQueryData(queryKeys.studio.course(id), data);
    },
  });

  const reorderLessons = useMutation({
    mutationFn: async ({ moduleId, orderedIds }: { moduleId: string; orderedIds: string[] }) =>
      (await api.post(`/studio/modules/${moduleId}/lessons/reorder`, { orderedIds })).data,
    onSuccess: invalidate,
  });

  const publish = useMutation({
    mutationFn: async () => (await api.post(`/studio/courses/${id}/publish`)).data,
    onSuccess: () => {
      invalidate();
      void qc.invalidateQueries({ queryKey: queryKeys.studio.courses });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const course = courseQuery.data;

  async function onModuleDragEnd(event: DragEndEvent) {
    if (!course) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = course.modules.map((m) => m.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(ids, oldIndex, newIndex);
    qc.setQueryData(queryKeys.studio.course(id), {
      ...course,
      modules: arrayMove(course.modules, oldIndex, newIndex),
    });
    reorderModules.mutate(next);
  }

  if (courseQuery.isLoading) {
    return <p className="text-[14px] text-[var(--muted)]">Loading curriculum…</p>;
  }

  if (courseQuery.isError || !course) {
    return (
      <div className="space-y-3">
        <p className="text-[14px] text-[var(--danger)]">Course not found.</p>
        <Link href="/studio">
          <Button variant="secondary">Back to courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/studio"
            className="mb-3 inline-flex items-center gap-1 text-[14px] text-[var(--muted)] hover:text-[var(--text)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Courses
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-[family-name:var(--font-display)] text-[28px] font-bold tracking-tight"
          >
            {course.title}
          </motion.h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone={course.status === "PUBLISHED" ? "success" : "default"}>{course.status}</Badge>
            <span className="text-[14px] text-[var(--muted)]">/{course.slug}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/studio/courses/${id}/quizzes`}>
            <Button variant="secondary">
              <FileQuestion className="h-4 w-4" />
              Quizzes
            </Button>
          </Link>
          <Button
            disabled={publish.isPending || course.status === "PUBLISHED"}
            onClick={() => publish.mutate()}
          >
            <Rocket className="h-4 w-4" />
            {course.status === "PUBLISHED" ? "Published" : publish.isPending ? "Publishing…" : "Publish"}
          </Button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => void onModuleDragEnd(e)}>
        <SortableContext items={course.modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {course.modules.map((mod) => (
              <ModuleBlock
                key={mod.id}
                module={mod}
                courseId={id}
                onRenameModule={async (moduleId, title) => {
                  await renameModule.mutateAsync({ moduleId, title });
                }}
                onAddLesson={async (moduleId, title) => {
                  await addLesson.mutateAsync({ moduleId, title });
                }}
                onRenameLesson={async (lessonId, title) => {
                  await renameLesson.mutateAsync({ lessonId, title });
                }}
                onReorderLessons={async (moduleId, orderedIds) => {
                  const modIndex = course.modules.findIndex((m) => m.id === moduleId);
                  if (modIndex >= 0) {
                    const lessonsById = Object.fromEntries(
                      course.modules[modIndex].lessons.map((l) => [l.id, l]),
                    );
                    const nextLessons = orderedIds
                      .map((lid) => lessonsById[lid])
                      .filter(Boolean);
                    const nextModules = [...course.modules];
                    nextModules[modIndex] = { ...nextModules[modIndex], lessons: nextLessons };
                    qc.setQueryData(queryKeys.studio.course(id), { ...course, modules: nextModules });
                  }
                  await reorderLessons.mutateAsync({ moduleId, orderedIds });
                }}
                onDeleteLesson={async (lessonId) => {
                  await deleteLesson.mutateAsync(lessonId);
                }}
                onDeleteModule={async (moduleId) => {
                  await deleteModule.mutateAsync(moduleId);
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {course.modules.length === 0 && (
        <p className="text-[14px] text-[var(--muted)]">No modules yet — add your first section below.</p>
      )}

      <div className="flex gap-2 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-4">
        <Input
          value={moduleTitle}
          onChange={(e) => setModuleTitle(e.target.value)}
          placeholder="Module title (e.g. Getting started)"
          onKeyDown={(e) => {
            if (e.key === "Enter" && moduleTitle.trim()) {
              addModule.mutate(moduleTitle.trim());
            }
          }}
        />
        <Button
          variant="secondary"
          disabled={addModule.isPending || !moduleTitle.trim()}
          onClick={() => addModule.mutate(moduleTitle.trim())}
        >
          <Plus className="h-4 w-4" />
          Module
        </Button>
      </div>
    </div>
  );
}
