"use client";
import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Send } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { AcademicMarkdown } from "./AcademicMarkdown";
type Reply = { id: string; bodyMd: string; author: { name: string } };
type Thread = Reply & {
  title: string;
  status: string;
  replies?: Reply[];
  _count?: { replies: number };
};
type ThreadPage = { items: Thread[]; metadata: { totalPages: number } };
function ThreadReplies({ thread }: { thread: Thread }) {
  const [expanded, setExpanded] = useState(false);
  const [reply, setReply] = useState("");
  const client = useQueryClient();
  const detail = useQuery({
    queryKey: ["discussion", thread.id],
    enabled: expanded,
    queryFn: async () =>
      (await api.get<Thread>(`/discussions/${thread.id}`)).data,
  });
  const send = useMutation({
    mutationFn: () =>
      api.post(`/discussions/${thread.id}/replies`, { bodyMd: reply.trim() }),
    onSuccess: () => {
      setReply("");
      void client.invalidateQueries({ queryKey: ["discussion", thread.id] });
      void client.invalidateQueries({ queryKey: ["discussions"] });
    },
  });
  return (
    <>
      <button
        type="button"
        className="mt-3 text-sm text-[var(--accent-2)]"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "Hide replies" : `Replies (${thread._count?.replies ?? 0})`}
      </button>
      {expanded && (
        <div className="mt-3 space-y-3 border-l pl-4">
          {detail.isLoading && (
            <p className="text-sm text-[var(--muted)]">Loading replies...</p>
          )}
          {detail.isError && (
            <p className="text-sm text-[var(--danger)]">
              Could not load replies.{" "}
              <button
                onClick={() => void detail.refetch()}
                className="underline"
              >
                Try again
              </button>
            </p>
          )}
          {detail.data?.replies?.map((item) => (
            <div key={item.id}>
              <p className="text-sm font-medium">{item.author.name}</p>
              <AcademicMarkdown>{item.bodyMd}</AcademicMarkdown>
            </div>
          ))}
          {thread.status !== "LOCKED" && (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (reply.trim()) send.mutate();
              }}
            >
              <input
                aria-label="Write a reply"
                required
                className="min-w-0 flex-1 rounded-lg border bg-[var(--surface-2)] px-3 py-2 text-sm"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Add a thoughtful reply"
              />
              <Button
                type="submit"
                size="sm"
                disabled={send.isPending || !reply.trim()}
              >
                Send
              </Button>
            </form>
          )}
          {send.isError && (
            <p role="alert" className="text-sm text-[var(--danger)]">
              Reply could not be sent. Please try again.
            </p>
          )}
        </div>
      )}
    </>
  );
}
export function DiscussionPanel({
  courseId,
  lessonId,
}: {
  courseId?: string;
  lessonId?: string;
}) {
  const [draft, setDraft] = useState("");
  const [page, setPage] = useState(1);
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["discussions", courseId, lessonId, page],
    enabled: !!courseId,
    queryFn: async () =>
      (
        await api.get<ThreadPage>("/discussions", {
          params: { courseId, lessonId, page, pageSize: 10 },
        })
      ).data,
  });
  const create = useMutation({
    mutationFn: () =>
      api.post("/discussions", {
        courseId,
        lessonId,
        title: draft.trim().slice(0, 100),
        bodyMd: draft.trim(),
      }),
    onSuccess: () => {
      setDraft("");
      setPage(1);
      void client.invalidateQueries({
        queryKey: ["discussions", courseId, lessonId],
      });
    },
  });
  function submit(e: FormEvent) {
    e.preventDefault();
    if (draft.trim()) create.mutate();
  }
  return (
    <section
      aria-label="Lesson discussion"
      className="rounded-2xl border bg-[var(--surface)] p-5"
    >
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <MessageCircle size={18} />
        Discussion
      </h2>
      <form onSubmit={submit} className="mt-4 flex gap-2">
        <label htmlFor="new-discussion" className="sr-only">
          Start a discussion
        </label>
        <input
          id="new-discussion"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          required
          placeholder="Ask a question about this lesson"
          className="min-w-0 flex-1 rounded-xl border bg-[var(--surface-2)] px-3 text-sm"
        />
        <Button
          size="sm"
          type="submit"
          disabled={create.isPending || !draft.trim()}
        >
          <Send size={16} />
          Post
        </Button>
      </form>
      {create.isError && (
        <p role="alert" className="mt-3 text-sm text-[var(--danger)]">
          Your question could not be posted. Please try again.
        </p>
      )}
      <div className="mt-5 space-y-5">
        {query.isLoading && (
          <p className="text-sm text-[var(--muted)]">
            Loading the conversation...
          </p>
        )}
        {query.isError && (
          <p className="text-sm text-[var(--danger)]">
            Could not load the discussion.{" "}
            <button className="underline" onClick={() => void query.refetch()}>
              Try again
            </button>
          </p>
        )}
        {query.data?.items.map((thread) => (
          <article key={thread.id} className="border-b pb-4 last:border-0">
            <h3 className="text-base font-medium">{thread.title}</h3>
            <AcademicMarkdown>{thread.bodyMd}</AcademicMarkdown>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {thread.author.name}
            </p>
            <ThreadReplies thread={thread} />
          </article>
        ))}
        {query.isSuccess && !query.data.items.length && (
          <p className="text-sm text-[var(--muted)]">
            Be the first to ask a question. Share what you are thinking through.
          </p>
        )}
      </div>
      {(page > 1 || (query.data?.metadata.totalPages ?? 0) > 1) && (
        <div className="mt-5 flex justify-between">
          <Button
            size="sm"
            variant="ghost"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={page >= (query.data?.metadata.totalPages ?? 0)}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </section>
  );
}
