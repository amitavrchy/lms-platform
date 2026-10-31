"use client";

import { useState } from "react";
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
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LessonRow } from "./LessonRow";
import type { StudioModule } from "./types";

type Props = {
  module: StudioModule;
  courseId: string;
  onRenameModule: (moduleId: string, title: string) => Promise<void>;
  onAddLesson: (moduleId: string, title: string) => Promise<void>;
  onRenameLesson: (lessonId: string, title: string) => Promise<void>;
  onReorderLessons: (moduleId: string, orderedIds: string[]) => Promise<void>;
  onDeleteLesson?: (lessonId: string) => Promise<void>;
  onDeleteModule?: (moduleId: string) => Promise<void>;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64) || "lesson";
}

export function ModuleBlock({
  module,
  courseId,
  onRenameModule,
  onAddLesson,
  onRenameLesson,
  onReorderLessons,
  onDeleteLesson,
  onDeleteModule,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(module.title);
  const [lessonTitle, setLessonTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: module.id,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  async function saveTitle() {
    if (!title.trim() || title === module.title) {
      setEditing(false);
      setTitle(module.title);
      return;
    }
    setSaving(true);
    try {
      await onRenameModule(module.id, title.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function addLesson() {
    if (!lessonTitle.trim()) return;
    setAdding(true);
    try {
      await onAddLesson(module.id, lessonTitle.trim());
      setLessonTitle("");
    } finally {
      setAdding(false);
    }
  }

  async function onLessonDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = module.lessons.map((l) => l.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    await onReorderLessons(module.id, arrayMove(ids, oldIndex, newIndex));
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4"
    >
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          className="cursor-grab touch-none text-[var(--muted)] hover:text-[var(--text)]"
          aria-label="Drag module"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {editing ? (
          <div className="flex flex-1 items-center gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void saveTitle();
                if (e.key === "Escape") {
                  setEditing(false);
                  setTitle(module.title);
                }
              }}
              className="h-9"
              autoFocus
            />
            <Button size="sm" variant="secondary" disabled={saving} onClick={() => void saveTitle()}>
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditing(false);
                setTitle(module.title);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <h3 className="flex-1 text-[16px] font-semibold">{module.title}</h3>
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)} aria-label="Rename module">
              <Pencil className="h-4 w-4" />
            </Button>
            {onDeleteModule && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => void onDeleteModule(module.id)}
                aria-label="Delete module"
              >
                <X className="h-4 w-4 text-[var(--danger)]" />
              </Button>
            )}
          </>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => void onLessonDragEnd(e)}>
        <SortableContext items={module.lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {module.lessons.map((lesson) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                courseId={courseId}
                onRename={onRenameLesson}
                onDelete={onDeleteLesson}
              />
            ))}
            {module.lessons.length === 0 && (
              <p className="px-1 text-[14px] text-[var(--muted)]">No lessons yet — add one below.</p>
            )}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mt-3 flex gap-2">
        <Input
          value={lessonTitle}
          onChange={(e) => setLessonTitle(e.target.value)}
          placeholder="New lesson title"
          onKeyDown={(e) => {
            if (e.key === "Enter") void addLesson();
          }}
          className="h-10"
        />
        <Button size="sm" variant="secondary" disabled={adding || !lessonTitle.trim()} onClick={() => void addLesson()}>
          <Plus className="h-4 w-4" />
          Lesson
        </Button>
      </div>
      <p className="mt-1.5 text-[14px] text-[var(--muted)]">Slug will be: {slugify(lessonTitle || "lesson")}</p>
    </div>
  );
}

export { slugify };
