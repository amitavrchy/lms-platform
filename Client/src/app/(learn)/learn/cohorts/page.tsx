"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, CalendarDays, Users } from "lucide-react";
import { api } from "@/lib/api";
import { CohortTimeline } from "@/components/academic/CohortTimeline";
import { AnnouncementFeed } from "@/components/academic/AnnouncementFeed";

export default function CohortsPage() {
  const cohortQuery = useQuery({
    queryKey: ["cohorts", "me"],
    queryFn: async () => (await api.get("/cohorts/me")).data,
    retry: false,
  });
  const raw = cohortQuery.data;
  const cohorts = Array.isArray(raw)
    ? raw.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    : raw && typeof raw === "object"
      ? [raw as Record<string, unknown>]
      : [];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <p className="flex items-center gap-2 text-[14px] font-medium text-[var(--accent-2)]"><Users className="h-4 w-4" /> Academic community</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-[32px] font-bold tracking-tight">Your cohorts</h1>
        <p className="mt-2 max-w-2xl text-[16px] text-[var(--muted)]">A shared academic calendar, teaching-team updates, and the people learning alongside you.</p>
      </div>
      {cohortQuery.isLoading && <div className="grid gap-5 lg:grid-cols-2">{[1, 2].map(i => <div key={i} className="h-72 animate-pulse rounded-2xl bg-[var(--surface)]" />)}</div>}
      {cohortQuery.isError ? <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-[14px] text-[var(--muted)]">Cohort configuration is unavailable right now.</p> : !cohortQuery.isLoading && !cohorts.length ? <section className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8"><Users className="h-7 w-7 text-[var(--accent-2)]" /><h2 className="mt-4 text-[20px] font-semibold">No cohort assigned yet</h2><p className="mt-2 max-w-lg text-[14px] text-[var(--muted)]">When your course schedule is published, your live sessions, classmates, and announcements will appear here.</p></section> : <><div className="grid gap-5 lg:grid-cols-2">{cohorts.map((cohort, index) => { const name = typeof cohort.name === "string" ? cohort.name : `Learning cohort ${index + 1}`; const description = typeof cohort.description === "string" ? cohort.description : "A shared place for live sessions, announcements, and course discussion."; const timezone = typeof cohort.timezone === "string" ? cohort.timezone : "Your local timezone"; const members = typeof cohort.memberCount === "number" ? cohort.memberCount : typeof cohort.membersCount === "number" ? cohort.membersCount : undefined; return <section key={typeof cohort.id === "string" ? cohort.id : name} className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]"><div className="bg-gradient-to-br from-[var(--accent)]/25 via-[var(--surface)] to-[var(--accent-2)]/15 p-6"><p className="text-[14px] font-medium text-[var(--accent-2)]">Active cohort</p><h2 className="mt-2 text-[24px] font-semibold">{name}</h2><p className="mt-2 text-[14px] text-[var(--muted)]">{description}</p><div className="mt-5 flex flex-wrap gap-3 text-[14px] text-[var(--muted)]"><span className="inline-flex items-center gap-1"><CalendarDays className="h-4 w-4" />{timezone}</span>{members !== undefined && <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" />{members} learners</span>}<span className="inline-flex items-center gap-1"><Activity className="h-4 w-4" />Learning in progress</span></div></div><div className="p-5"><CohortTimeline cohort={cohort} /></div></section>})}</div><AnnouncementFeed /></>}
    </div>
  );
}
