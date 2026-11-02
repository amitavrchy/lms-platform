"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BellRing, Check } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { AcademicMarkdown } from "./AcademicMarkdown";

type Announcement = {
  id?: string;
  title?: string;
  bodyMd?: string;
  reads?: { readAt: string }[];
  body?: string;
  content?: string;
  message?: string;
  read?: boolean;
  isRead?: boolean;
  createdAt?: string;
  author?: { name?: string };
};
function announcements(data: unknown): Announcement[] {
  if (Array.isArray(data))
    return data.filter((item): item is Announcement =>
      Boolean(item && typeof item === "object"),
    );
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    return announcements(record.announcements ?? record.items ?? record.data);
  }
  return [];
}

export function AnnouncementFeed({ compact = false }: { compact?: boolean }) {
  const qc = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => (await api.get("/announcements")).data,
  });
  const client = useQueryClient();
  const markRead = useMutation({
    mutationFn: (id: string) => api.post(`/announcements/${id}/read`),
    onSuccess: () =>
      void client.invalidateQueries({ queryKey: ["announcements"] }),
  });
  const items = announcements(qc.data).slice(0, compact ? 3 : 20);
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[16px] font-semibold">
          <BellRing className="h-4 w-4 text-[var(--accent-2)]" /> Announcements
        </h2>
      </div>
      <div className="mt-4 space-y-3">
        {qc.isError && (
          <p role="alert" className="text-sm text-[var(--danger)]">
            Could not load announcements.{" "}
            <button className="underline" onClick={() => void qc.refetch()}>
              Try again
            </button>
          </p>
        )}
        {markRead.isError && (
          <p role="alert" className="text-sm text-[var(--danger)]">
            Could not mark the announcement as read.
          </p>
        )}
        {items.map((item, index) => {
          const read = Boolean(item.read ?? item.isRead ?? item.reads?.length);
          const announcementId = item.id;
          return (
            <article
              key={item.id ?? `${item.title}-${index}`}
              className="rounded-xl bg-[var(--surface-2)] p-4"
            >
              <div className="flex gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-[14px] font-semibold">
                    {item.title ?? "Course announcement"}
                  </h3>
                  <AcademicMarkdown className="mt-1 line-clamp-4 text-[14px] leading-6 text-[var(--muted)]">
                    {item.bodyMd ?? item.body ?? item.content ?? item.message}
                  </AcademicMarkdown>
                  <p className="mt-2 text-[14px] text-[var(--muted)]">
                    {item.author?.name ?? "Teaching team"}
                    {item.createdAt
                      ? ` · ${new Date(item.createdAt).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                {!read && announcementId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Mark announcement as read"
                    onClick={() => markRead.mutate(announcementId)}
                    disabled={markRead.isPending}
                  >
                    <Check className="h-4 w-4" /> Read
                  </Button>
                )}
              </div>
            </article>
          );
        })}
        {!qc.isLoading && !qc.isError && !items.length && (
          <p className="text-[14px] text-[var(--muted)]">
            Nothing new from your teaching team.
          </p>
        )}
      </div>
    </section>
  );
}
