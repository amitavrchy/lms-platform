"use client";

import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { api } from "@/lib/api";
import { CohortTimeline } from "@/components/academic/CohortTimeline";
import { AnnouncementFeed } from "@/components/academic/AnnouncementFeed";

export default function CohortsPage() {
  const cohortQuery = useQuery({
    queryKey: ["cohorts", "me"],
    queryFn: async () => (await api.get("/cohorts/me")).data,
    retry: false,
  });
  const cohort = cohortQuery.data && typeof cohortQuery.data === "object" ? cohortQuery.data as Record<string, unknown> : {};
  const name = typeof cohort.name === "string" ? cohort.name : "Your cohort";
  const description = typeof cohort.description === "string" ? cohort.description : "A shared place for live sessions, announcements, and course discussion.";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="flex items-center gap-2 text-[14px] font-medium text-[var(--accent-2)]"><Users className="h-4 w-4" /> Academic community</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-[32px] font-bold tracking-tight">{name}</h1>
        <p className="mt-2 max-w-2xl text-[16px] text-[var(--muted)]">{description}</p>
      </div>
      {cohortQuery.isError ? <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-[14px] text-[var(--muted)]">Cohort configuration is unavailable right now.</p> : <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]"><CohortTimeline cohort={cohortQuery.data} /><AnnouncementFeed /></div>}
    </div>
  );
}
