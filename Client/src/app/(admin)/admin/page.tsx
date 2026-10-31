"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Member = {
  id: string;
  role: string;
  user: { id: string; name: string; email: string };
};

type Report = {
  seatsUsed?: number;
  memberCount?: number;
  coursesPublished?: number;
  enrollmentsActive?: number;
  [key: string]: unknown;
};

type StudioCourse = { id: string; title: string; status: string };

export default function AdminPage() {
  const qc = useQueryClient();
  const [courseId, setCourseId] = useState("");
  const [userIds, setUserIds] = useState("");

  const members = useQuery({
    queryKey: queryKeys.admin.members,
    queryFn: async () => (await api.get<Member[]>("/admin/members")).data,
  });

  const reports = useQuery({
    queryKey: queryKeys.admin.reports,
    queryFn: async () => (await api.get<Report>("/admin/reports")).data,
  });

  const courses = useQuery({
    queryKey: queryKeys.studio.courses,
    queryFn: async () => (await api.get<StudioCourse[]>("/studio/courses")).data,
  });

  const published = useMemo(
    () => courses.data?.filter((c) => c.status === "PUBLISHED") ?? [],
    [courses.data],
  );

  const assign = useMutation({
    mutationFn: async () =>
      api.post("/admin/enrollments/assign", {
        courseId,
        userIds: userIds
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }),
    onSuccess: () => {
      toast.success("Courses assigned");
      void qc.invalidateQueries({ queryKey: queryKeys.admin.reports });
    },
    onError: () => toast.error("Assign failed"),
  });

  const updateRole = useMutation({
    mutationFn: async ({ membershipId, role }: { membershipId: string; role: string }) =>
      api.patch(`/admin/members/${membershipId}/role`, { role }),
    onSuccess: () => {
      toast.success("Role updated");
      void qc.invalidateQueries({ queryKey: queryKeys.admin.members });
    },
    onError: () => toast.error("Role update failed"),
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-[32px] font-bold">Org admin</h1>
        <p className="mt-2 text-[16px] text-[var(--muted)]">
          Members, seat usage, and course assignments.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Members", reports.data?.memberCount ?? reports.data?.seatsUsed ?? "—"],
          ["Published", reports.data?.coursesPublished ?? "—"],
          ["Active enrollments", reports.data?.enrollmentsActive ?? "—"],
        ].map(([label, value], i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <p className="text-[14px] text-[var(--muted)]">{label}</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-[28px] font-bold">
              {String(value)}
            </p>
          </motion.div>
        ))}
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-[16px] font-semibold">Assign course</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Course</Label>
            <select
              className="mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-[14px]"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              <option value="">Select…</option>
              {published.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>User IDs (comma-separated)</Label>
            <Input value={userIds} onChange={(e) => setUserIds(e.target.value)} placeholder="cuid, cuid" />
          </div>
        </div>
        <Button
          className="mt-4"
          disabled={!courseId || !userIds || assign.isPending}
          onClick={() => assign.mutate()}
        >
          Assign enrollments
        </Button>
      </section>

      <section className="space-y-3">
        <h2 className="text-[16px] font-semibold">Members</h2>
        {members.data?.map((m) => (
          <div
            key={m.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <div>
              <p className="text-[14px] font-medium">{m.user.name}</p>
              <p className="text-[14px] text-[var(--muted)]">{m.user.email}</p>
              <p className="mt-1 font-mono text-[14px] text-[var(--muted)]">{m.user.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge>{m.role}</Badge>
              <select
                className="h-10 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-2 text-[14px]"
                value={m.role}
                onChange={(e) =>
                  updateRole.mutate({ membershipId: m.id, role: e.target.value })
                }
              >
                {["OWNER", "ADMIN", "INSTRUCTOR", "TA", "LEARNER"].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
