"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircleQuestion, Pin, Send, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

type Item = Record<string, unknown>;
const items = (data: unknown): Item[] =>
  Array.isArray(data)
    ? data
    : Array.isArray((data as Item)?.data)
      ? ((data as Item).data as Item[])
      : Array.isArray((data as Item)?.items)
        ? ((data as Item).items as Item[])
        : [];
const value = (data: Item, keys: string[]) =>
  keys
    .map((key) => data[key])
    .find((item): item is string => typeof item === "string") ?? "";

export default function CommunityPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"announcements" | "questions">(
    "announcements",
  );
  const [notice, setNotice] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const courses = useQuery({
    queryKey: ["studio", "courses"],
    queryFn: async () => items((await api.get("/studio/courses")).data),
  });
  const courseId = selectedCourse || String(courses.data?.[0]?.id ?? "");
  const announcements = useQuery({
    queryKey: ["studio", "announcements"],
    queryFn: async () => items((await api.get("/studio/announcements")).data),
  });
  const discussions = useQuery({
    queryKey: ["discussions", "studio", courseId],
    enabled: tab === "questions" && !!courseId,
    queryFn: async () =>
      items(
        (await api.get("/discussions", { params: { courseId, pageSize: 100 } }))
          .data,
      ),
  });
  const publish = useMutation({
    mutationFn: async (body: Item) => api.post("/studio/announcements", body),
    onSuccess: () => {
      setNotice("Announcement published.");
      void qc.invalidateQueries({ queryKey: ["studio", "announcements"] });
    },
    onError: () => setNotice("Announcement could not be published."),
  });
  const moderate = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Item }) =>
      api.patch(`/studio/discussions/${id}`, body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["discussions"] }),
  });
  function announce(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    publish.mutate({
      title: form.get("title"),
      bodyMd: form.get("body"),
      publish: true,
    });
    event.currentTarget.reset();
  }
  const rows =
    tab === "announcements"
      ? (announcements.data ?? [])
      : (discussions.data ?? []);
  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-[32px] font-bold">
          Community
        </h1>
        <p className="mt-1 text-[16px] text-[var(--muted)]">
          Share course updates and help learners get unstuck.
        </p>
      </header>
      <div
        role="tablist"
        aria-label="Community content"
        className="inline-flex rounded-xl bg-[var(--surface-2)] p-1"
      >
        {(["announcements", "questions"] as const).map((name) => (
          <button
            key={name}
            role="tab"
            aria-selected={tab === name}
            onClick={() => setTab(name)}
            className={`rounded-lg px-4 py-2 text-[14px] font-medium capitalize ${tab === name ? "bg-[var(--surface)] shadow-sm" : "text-[var(--muted)]"}`}
          >
            {name === "questions" ? "Q&A moderation" : "Announcements"}
          </button>
        ))}
      </div>
      {notice && (
        <p
          role="status"
          className="rounded-xl bg-[var(--surface-2)] px-4 py-3 text-[14px]"
        >
          {notice}
        </p>
      )}
      {tab === "announcements" && (
        <form
          onSubmit={announce}
          className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
        >
          <h2 className="text-[18px] font-semibold">New announcement</h2>
          <label className="sr-only" htmlFor="announcement-title">
            Title
          </label>
          <input
            id="announcement-title"
            required
            name="title"
            placeholder="What should learners know?"
            className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-[14px]"
          />
          <label className="sr-only" htmlFor="announcement-body">
            Message
          </label>
          <textarea
            id="announcement-body"
            required
            name="body"
            rows={3}
            placeholder="Write a clear, actionable update…"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-[14px]"
          />
          <Button type="submit" disabled={publish.isPending}>
            <Send className="h-4 w-4" />
            {publish.isPending ? "Publishing…" : "Publish announcement"}
          </Button>
        </form>
      )}
      {tab === "questions" && (
        <label className="block text-sm">
          Course
          <select
            className="ml-3 max-w-full rounded-lg border bg-[var(--surface)] px-3 py-2"
            value={courseId}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            {courses.data?.map((course) => (
              <option key={String(course.id)} value={String(course.id)}>
                {String(course.title)}
              </option>
            ))}
          </select>
        </label>
      )}
      {(announcements.isError ||
        (tab === "questions" && discussions.isError)) && (
        <p role="alert" className="text-sm text-[var(--danger)]">
          Could not load community activity. Please try again.
        </p>
      )}
      {moderate.isError && (
        <p role="alert" className="text-sm text-[var(--danger)]">
          Could not update the discussion.
        </p>
      )}
      <section aria-live="polite" className="space-y-3">
        {(tab === "announcements"
          ? announcements.isLoading
          : discussions.isLoading) && (
          <p className="text-[14px] text-[var(--muted)]">
            Loading community activity…
          </p>
        )}
        {!rows.length &&
          !(tab === "announcements"
            ? announcements.isLoading
            : discussions.isLoading) && (
            <p className="rounded-2xl border border-dashed border-[var(--border)] p-6 text-[14px] text-[var(--muted)]">
              Nothing here yet.{" "}
              {tab === "announcements"
                ? "Publish a course update to get started."
                : "Learner questions will appear here for review."}
            </p>
          )}
        {rows.map((row, i) => {
          const id = String(row.id ?? i);
          const resolved = row.status === "RESOLVED";
          const pinned = Boolean(row.pinned ?? row.isPinned);
          return (
            <article
              key={id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-[18px] font-semibold">
                    {value(row, ["title", "subject"]) ||
                      (tab === "questions"
                        ? "Learner question"
                        : "Announcement")}
                  </h2>
                  <p className="mt-1 whitespace-pre-wrap text-[14px] text-[var(--muted)]">
                    {value(row, ["bodyMd", "body", "content", "message"]) ||
                      "No message content was returned."}
                  </p>
                </div>
                {pinned && (
                  <span className="inline-flex items-center gap-1 text-[14px] text-[var(--accent)]">
                    <Pin className="h-4 w-4" />
                    Pinned
                  </span>
                )}
              </div>
              {tab === "questions" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      moderate.mutate({
                        id,
                        body: { status: resolved ? "OPEN" : "RESOLVED" },
                      })
                    }
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {resolved ? "Reopen" : "Mark resolved"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      moderate.mutate({ id, body: { pinned: !pinned } })
                    }
                  >
                    <Pin className="h-4 w-4" />
                    {pinned ? "Unpin" : "Pin"}
                  </Button>
                  <span className="ml-auto inline-flex items-center gap-1 text-[14px] text-[var(--muted)]">
                    <MessageCircleQuestion className="h-4 w-4" />
                    {resolved ? "Resolved" : "Needs review"}
                  </span>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
