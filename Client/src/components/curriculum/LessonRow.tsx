"use client";

import { useState } from "react";
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Check, X, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { StudioLesson } from "./types";

type Props = {
  lesson: StudioLesson;
  courseId: string;
  onRename: (lessonId: string, title: string) => Promise<void>;
  onDelete?: (lessonId: string) => Promise<void>;
};

export function LessonRow({ lesson, courseId, onRename, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [saving, setSaving] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lesson.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  async function save() {
    if (!title.trim() || title === lesson.title) {
      setEditing(false);
      setTitle(lesson.title);
      return;
    }
    setSaving(true);
    try {
      await onRename(lesson.id, title.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5"
    >
      <button
        type="button"
        className="cursor-grab touch-none text-[var(--muted)] hover:text-[var(--text)]"
        aria-label="Drag lesson"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="flex items-center gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void save();
                if (e.key === "Escape") {
                  setEditing(false);
                  setTitle(lesson.title);
                }
              }}
              className="h-9"
              autoFocus
            />
            <Button size="sm" variant="secondary" disabled={saving} onClick={() => void save()}>
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditing(false);
                setTitle(lesson.title);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[14px] font-medium">{lesson.title}</span>
            {lesson.quiz ? (
              <Badge tone="accent">Quiz</Badge>
            ) : (
              <Badge>No quiz</Badge>
            )}
          </div>
        )}
      </div>

      {!editing && (
        <div className="flex shrink-0 items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)} aria-label="Rename lesson">
            <Pencil className="h-4 w-4" />
          </Button>
          <Link href={`/studio/courses/${courseId}/quizzes`}>
            <Button size="sm" variant="ghost" aria-label="Quizzes">
              <FileQuestion className="h-4 w-4" />
            </Button>
          </Link>
          {onDelete && (
            <Button size="sm" variant="ghost" onClick={() => void onDelete(lesson.id)} aria-label="Delete lesson">
              <X className="h-4 w-4 text-[var(--danger)]" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
