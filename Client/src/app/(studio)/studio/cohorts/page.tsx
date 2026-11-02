"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, Pencil, Plus, Users } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

type RecordData = Record<string, unknown>;
type Cohort = RecordData & { id: string; name?: string; title?: string; status?: string; courseId?: string };
const list = (value: unknown): RecordData[] => Array.isArray(value) ? value : Array.isArray((value as RecordData)?.data) ? ((value as RecordData).data as RecordData[]) : Array.isArray((value as RecordData)?.items) ? ((value as RecordData).items as RecordData[]) : [];
const text = (value: unknown) => typeof value === "string" ? value : "";

export default function CohortsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Cohort | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState("");
  const cohortsQuery = useQuery({ queryKey: ["studio", "cohorts"], queryFn: async () => list((await api.get("/studio/cohorts")).data) as Cohort[] });
  const selected = useMemo(() => (cohortsQuery.data ?? []).find((cohort) => cohort.id === selectedId) ?? cohortsQuery.data?.[0], [cohortsQuery.data, selectedId]);
  const detailsQuery = useQuery({ queryKey: ["studio", "cohort", selected?.id], enabled: !!selected?.id, queryFn: async () => list((await api.get(`/studio/cohorts/${selected!.id}/enrollments`)).data) });
  const create = useMutation({
    mutationFn: async (payload: RecordData) => editing?.id ? api.patch(`/studio/cohorts/${editing.id}`, payload) : api.post("/studio/cohorts", payload),
    onSuccess: () => { setEditing(null); setMessage("Cohort saved."); void qc.invalidateQueries({ queryKey: ["studio", "cohorts"] }); },
    onError: () => setMessage("We could not save this cohort. Please try again."),
  });
  const session = useMutation({
    mutationFn: async (payload: RecordData) => api.post(`/studio/cohorts/${selected?.id}/sessions`, payload),
    onSuccess: () => setMessage("Session scheduled."), onError: () => setMessage("Session could not be scheduled."),
  });

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    create.mutate({ name: data.get("name"), courseId: data.get("courseId"), startsAt: data.get("startsAt"), status: data.get("status") });
  }
  return <div className="mx-auto max-w-6xl space-y-7">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-[family-name:var(--font-display)] text-[32px] font-bold">Cohorts</h1><p className="mt-1 text-[16px] text-[var(--muted)]">Run instructor-led groups, live sessions, and release plans.</p></div><Button onClick={() => setEditing({ id: "" })}><Plus className="h-4 w-4" />Create cohort</Button></header>
    {message && <p role="status" className="rounded-xl bg-[var(--surface-2)] px-4 py-3 text-[14px]">{message}</p>}
    {editing && <form onSubmit={save} className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 md:grid-cols-4">
      <label className="text-[14px]">Cohort name<input required name="name" defaultValue={text(editing.name ?? editing.title)} className="mt-1 h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3" /></label>
      <label className="text-[14px]">Course ID<input name="courseId" defaultValue={text(editing.courseId)} className="mt-1 h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3" /></label>
      <label className="text-[14px]">Starts<input name="startsAt" type="datetime-local" className="mt-1 h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3" /></label>
      <label className="text-[14px]">Status<select name="status" defaultValue={text(editing.status) || "ACTIVE"} className="mt-1 h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3"><option>ACTIVE</option><option>DRAFT</option><option>ARCHIVED</option></select></label>
      <div className="md:col-span-4 flex gap-2"><Button type="submit" disabled={create.isPending}>{create.isPending ? "Saving…" : "Save cohort"}</Button><Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button></div>
    </form>}
    <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">
      <section aria-label="Cohort list" className="space-y-3">{cohortsQuery.isLoading && <p className="text-[14px] text-[var(--muted)]">Loading cohorts…</p>}{!cohortsQuery.isLoading && !cohortsQuery.data?.length && <p className="rounded-2xl border border-dashed border-[var(--border)] p-5 text-[14px] text-[var(--muted)]">No cohorts yet. Create one to organize a guided course run.</p>}
        {(cohortsQuery.data ?? []).map((cohort) => <button key={cohort.id} onClick={() => setSelectedId(cohort.id)} className={`w-full rounded-2xl border p-4 text-left ${selected?.id === cohort.id ? "border-[var(--accent)] bg-[var(--surface-2)]" : "border-[var(--border)] bg-[var(--surface)]"}`}><div className="flex justify-between gap-3"><span className="font-semibold">{text(cohort.name ?? cohort.title) || "Untitled cohort"}</span><span className="text-[14px] text-[var(--muted)]">{text(cohort.status) || "ACTIVE"}</span></div><p className="mt-2 text-[14px] text-[var(--muted)]">Course: {text(cohort.courseId) || "Not linked"}</p><span onClick={(e) => { e.stopPropagation(); setEditing(cohort); }} className="mt-3 inline-flex items-center gap-1 text-[14px] text-[var(--accent)]"><Pencil className="h-3.5 w-3.5" />Edit</span></button>)}</section>
      <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><div><h2 className="text-[20px] font-semibold">{selected ? text(selected.name ?? selected.title) || "Cohort workspace" : "Cohort workspace"}</h2><p className="text-[14px] text-[var(--muted)]">Roster, sessions, and staged course release.</p></div>
        {selected ? <><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-[var(--surface-2)] p-4"><Users className="h-4 w-4 text-[var(--accent)]" /><p className="mt-2 text-[14px] text-[var(--muted)]">Roster</p><p className="text-[22px] font-bold">{detailsQuery.data?.length ?? "—"}</p></div><div className="rounded-xl bg-[var(--surface-2)] p-4"><CalendarPlus className="h-4 w-4 text-[var(--accent)]" /><p className="mt-2 text-[14px] text-[var(--muted)]">Course release</p><p className="text-[14px] font-medium">Configure weekly drip in course settings</p></div></div>
        <form onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); session.mutate({ title: f.get("title"), startsAt: f.get("startsAt") }); }} className="flex flex-wrap gap-2"><input aria-label="Session title" required name="title" placeholder="Session title" className="h-10 flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-[14px]" /><input aria-label="Session start time" required name="startsAt" type="datetime-local" className="h-10 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-[14px]" /><Button type="submit" variant="secondary" disabled={session.isPending}>Schedule</Button></form>
        <div><h3 className="mb-2 text-[16px] font-semibold">Learners</h3>{detailsQuery.isLoading ? <p className="text-[14px] text-[var(--muted)]">Loading roster…</p> : detailsQuery.data?.length ? <ul className="space-y-2">{detailsQuery.data.slice(0, 6).map((row, i) => <li key={String(row.id ?? i)} className="rounded-lg bg-[var(--surface-2)] px-3 py-2 text-[14px]">{text(row.name ?? (row.user as RecordData)?.name ?? row.email) || "Learner"}</li>)}</ul> : <p className="text-[14px] text-[var(--muted)]">No roster entries returned yet.</p>}</div></> : <p className="text-[14px] text-[var(--muted)]">Select a cohort to manage its teaching run.</p>}</section>
    </div>
  </div>;
}
