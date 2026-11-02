"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Download, Search, UserPlus } from "lucide-react";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { StudioCourseListItem } from "@/components/curriculum/types";

type Member = {
  id: string;
  role: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string | null;
    createdAt: string;
  };
};

type Reports = {
  seatsUsed: number;
  coursesTotal: number;
  coursesPublished: number;
  enrollments: number;
  completions: number;
};

const ROLES = ["OWNER", "ADMIN", "INSTRUCTOR", "TA", "LEARNER"] as const;

export default function AdminPage() {
  const qc = useQueryClient();
  const [courseId, setCourseId] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [assignMsg, setAssignMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const membersQuery = useQuery({
    queryKey: queryKeys.admin.members,
    queryFn: async () => (await api.get<Member[]>("/admin/members")).data,
  });

  const reportsQuery = useQuery({
    queryKey: queryKeys.admin.reports,
    queryFn: async () => (await api.get<Reports>("/admin/reports")).data,
  });

  const coursesQuery = useQuery({
    queryKey: queryKeys.studio.courses,
    queryFn: async () => (await api.get<StudioCourseListItem[]>("/studio/courses")).data,
  });

  const updateRole = useMutation({
    mutationFn: async ({ membershipId, role }: { membershipId: string; role: string }) =>
      (await api.patch(`/admin/members/${membershipId}/role`, { role })).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.admin.members }),
  });

  const assign = useMutation({
    mutationFn: async () =>
      (
        await api.post("/admin/enrollments/assign", {
          courseId,
          userIds: Array.from(selectedUserIds),
        })
      ).data as { courseId: string; results: { userId: string; ok: boolean; reason?: string }[] },
    onSuccess: (data) => {
      const ok = data.results.filter((r) => r.ok).length;
      const fail = data.results.length - ok;
      setAssignMsg(`Assigned ${ok} learner(s)${fail ? `, ${fail} skipped` : ""}.`);
      setSelectedUserIds(new Set());
      void qc.invalidateQueries({ queryKey: queryKeys.admin.reports });
    },
  });

  const members = membersQuery.data ?? [];
  const visibleMembers = members.filter((member) => {
    const haystack = `${member.user.name} ${member.user.email}`.toLowerCase();
    return haystack.includes(search.toLowerCase()) && (roleFilter === "ALL" || member.role === roleFilter);
  });
  const reports = reportsQuery.data;

  const reportCards = useMemo(
    () =>
      reports
        ? [
            { label: "Seats used", value: reports.seatsUsed },
            { label: "Courses", value: reports.coursesTotal },
            { label: "Published", value: reports.coursesPublished },
            { label: "Enrollments", value: reports.enrollments },
            { label: "Completions", value: reports.completions },
          ]
        : [],
    [reports],
  );

  function toggleUser(userId: string) {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  function downloadCsv() {
    const rows = [["Name", "Email", "Role", "Joined"], ...members.map((member) => [member.user.name, member.user.email, member.role, member.user.createdAt])];
    const escape = (cell: string) => `"${String(cell).replaceAll('"', '""')}"`;
    const url = URL.createObjectURL(new Blob([rows.map((row) => row.map(escape).join(",")).join("\n")], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "learnora-members.csv"; anchor.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-[family-name:var(--font-display)] text-[32px] font-bold tracking-tight"
        >
          Organization admin
        </motion.h1>
        <p className="mt-2 text-[16px] text-[var(--muted)]">Members, enrollments, and org reports.</p>
      </div>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-[20px] font-semibold">Organization signals</h2><Button variant="secondary" size="sm" onClick={downloadCsv}><Download className="h-4 w-4" />Export member CSV</Button></div>
        {reportsQuery.isLoading && <p className="text-[14px] text-[var(--muted)]">Loading…</p>}
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {reportCards.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <p className="text-[14px] text-[var(--muted)]">{c.label}</p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-[26px] font-bold">{c.value}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-[20px] font-semibold">Assign course</h2>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
          <div>
            <Label htmlFor="assign-course">Course</Label>
            <select
              id="assign-course"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="flex h-11 w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 text-[14px]"
            >
              <option value="">Select course…</option>
              {(coursesQuery.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.status})
                </option>
              ))}
            </select>
          </div>
          <p className="text-[14px] text-[var(--muted)]">
            Select members below, then assign. Selected: {selectedUserIds.size}
          </p>
          <Button
            disabled={!courseId || selectedUserIds.size === 0 || assign.isPending}
            onClick={() => {
              setAssignMsg(null);
              assign.mutate();
            }}
          >
            <UserPlus className="h-4 w-4" />
            {assign.isPending ? "Assigning…" : "Assign enrollments"}
          </Button>
          {assign.isError && (
            <p className="text-[14px] text-[var(--danger)]">Assign failed.</p>
          )}
          {assignMsg && <p className="text-[14px] text-[var(--success)]">{assignMsg}</p>}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-[20px] font-semibold">Members</h2><p className="text-[14px] text-[var(--muted)]">{visibleMembers.length} shown · select learners for a bulk course assignment</p></div>
        <div className="flex flex-wrap gap-3">
          <label className="relative min-w-[220px] flex-1"><span className="sr-only">Search members</span><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[var(--muted)]" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email" className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-[14px]" /></label>
          <select aria-label="Filter members by role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-[14px]"><option value="ALL">All roles</option>{ROLES.map((role) => <option key={role}>{role}</option>)}</select>
        </div>
        {membersQuery.isLoading && <p className="text-[14px] text-[var(--muted)]">Loading members…</p>}
        <div className="space-y-2">
          {visibleMembers.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
            >
              <label className="flex cursor-pointer items-center gap-3 min-w-0 flex-1">
                <input
                  type="checkbox"
                  checked={selectedUserIds.has(m.user.id)}
                  onChange={() => toggleUser(m.user.id)}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-medium">{m.user.name}</p>
                  <p className="truncate text-[14px] text-[var(--muted)]">{m.user.email}</p>
                </div>
              </label>
              <Badge tone={m.role === "OWNER" || m.role === "ADMIN" ? "accent" : "default"}>
                {m.role}
              </Badge>
              <select
                value={m.role}
                disabled={m.role === "OWNER" || updateRole.isPending}
                onChange={(e) =>
                  updateRole.mutate({ membershipId: m.id, role: e.target.value })
                }
                className="h-10 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-[14px] disabled:opacity-50"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r} disabled={r === "OWNER" && m.role !== "OWNER"}>
                    {r}
                  </option>
                ))}
              </select>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
