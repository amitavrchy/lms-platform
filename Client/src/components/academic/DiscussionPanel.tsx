"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Send } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

type Reply = { id?: string; body?: string; content?: string; createdAt?: string; author?: { name?: string } };
type Thread = Reply & { title?: string; replies?: Reply[]; replyCount?: number };
function list(data: unknown): Thread[] {
  if (Array.isArray(data)) return data.filter((item): item is Thread => Boolean(item && typeof item === "object"));
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    return list(record.discussions ?? record.items ?? record.data ?? record.threads);
  }
  return [];
}
function text(item: Reply) { return item.body ?? item.content ?? ""; }

export function DiscussionPanel({ courseId, lessonId }: { courseId?: string; lessonId?: string }) {
  const [draft, setDraft] = useState("");
  const [replying, setReplying] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [page, setPage] = useState(1);
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["discussions", courseId, lessonId, page],
    queryFn: async () => (await api.get("/discussions", { params: { courseId, lessonId, page, limit: 10 } })).data,
    enabled: Boolean(courseId || lessonId),
  });
  const create = useMutation({
    mutationFn: (body: string) => api.post("/discussions", { body, courseId, lessonId }),
    onSuccess: () => { setDraft(""); void client.invalidateQueries({ queryKey: ["discussions", courseId, lessonId] }); },
  });
  const postReply = useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => api.post(`/discussions/${id}/replies`, { body }),
    onSuccess: () => { setReply(""); setReplying(null); void client.invalidateQueries({ queryKey: ["discussions", courseId, lessonId] }); },
  });
  const threads = list(query.data);
  const pageInfo = query.data && typeof query.data === "object" ? query.data as Record<string, unknown> : {};
  const hasNext = Boolean(pageInfo.hasNext ?? (pageInfo.pagination as Record<string, unknown> | undefined)?.hasNext);
  const submit = (event: FormEvent) => { event.preventDefault(); if (draft.trim()) create.mutate(draft.trim()); };

  return (
    <section aria-label="Lesson discussion" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <h2 className="flex items-center gap-2 text-[16px] font-semibold"><MessageCircle className="h-4 w-4 text-[var(--accent-2)]" /> Discussion</h2>
      <form onSubmit={submit} className="mt-4 flex gap-2">
        <label className="sr-only" htmlFor="new-discussion">Start a discussion</label>
        <input id="new-discussion" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask the cohort a question…" className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-[14px] outline-none focus:ring-2 focus:ring-[var(--ring)]" />
        <Button size="sm" type="submit" disabled={create.isPending || !draft.trim()}><Send className="h-4 w-4" /> Post</Button>
      </form>
      <div className="mt-5 space-y-4">
        {threads.map((thread, index) => <article key={thread.id ?? `${thread.title}-${index}`} className="border-b border-[var(--border)] pb-4 last:border-0">
          <p className="text-[14px] font-medium">{thread.title}</p>
          <p className="mt-1 whitespace-pre-wrap text-[14px] text-[var(--muted)]">{text(thread)}</p>
          <p className="mt-2 text-[14px] text-[var(--muted)]">{thread.author?.name ?? "Learner"}{thread.createdAt ? ` · ${new Date(thread.createdAt).toLocaleDateString()}` : ""}</p>
          {(thread.replies ?? []).map((item, replyIndex) => <div key={item.id ?? replyIndex} className="mt-3 ml-3 border-l border-[var(--border)] pl-3 text-[14px]"><span className="font-medium">{item.author?.name ?? "Learner"}: </span><span className="text-[var(--muted)]">{text(item)}</span></div>)}
          {thread.id && <button type="button" onClick={() => { const threadId = thread.id ?? ""; setReplying(replying === threadId ? null : threadId); }} className="mt-3 text-[14px] text-[var(--accent-2)]">Reply{thread.replyCount ? ` (${thread.replyCount})` : ""}</button>}
          {thread.id && replying === thread.id && <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (reply.trim()) postReply.mutate({ id: thread.id!, body: reply.trim() }); }}><input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Add a thoughtful reply" className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[14px]" /><Button size="sm" type="submit">Send</Button></form>}
        </article>)}
        {!query.isLoading && !threads.length && <p className="text-[14px] text-[var(--muted)]">Be the first to start the conversation.</p>}
      </div>
      {(page > 1 || hasNext) && <div className="mt-4 flex justify-between"><Button size="sm" variant="ghost" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><Button size="sm" variant="ghost" disabled={!hasNext} onClick={() => setPage((value) => value + 1)}>Next</Button></div>}
    </section>
  );
}
