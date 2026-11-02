"use client";
import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, Pencil, Plus, Users } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { CohortTimeline } from "@/components/academic/CohortTimeline";
import { useAppSelector } from "@/store/hooks";
type Course = { id: string; title: string };
type Cohort = {
  id: string;
  name: string;
  slug: string;
  courseId: string;
  startsAt: string;
  status: string;
  timezone: string;
  description?: string;
  course?: Course;
};
type Enrollment = {
  id: string;
  user: { id: string; name: string; email: string };
};
const field =
  "mt-1 h-11 w-full rounded-lg border bg-[var(--surface)] px-3 text-sm";
function localDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}
export default function CohortsPage() {
  const qc = useQueryClient();
  const user = useAppSelector((s) => s.auth.user);
  const [editing, setEditing] = useState<Partial<Cohort> | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState("");
  const [learnerId, setLearnerId] = useState("");
  const cohorts = useQuery({
    queryKey: ["studio", "cohorts"],
    queryFn: async () => (await api.get<Cohort[]>("/studio/cohorts")).data,
  });
  const courses = useQuery({
    queryKey: ["studio", "courses"],
    queryFn: async () => (await api.get<Course[]>("/studio/courses")).data,
  });
  const selected =
    cohorts.data?.find((c) => c.id === selectedId) ?? cohorts.data?.[0];
  const roster = useQuery({
    queryKey: ["studio", "cohort-roster", selected?.id],
    enabled: !!selected,
    queryFn: async () =>
      (await api.get<Enrollment[]>(`/studio/cohorts/${selected!.id}/roster`))
        .data,
  });
  const detail = useQuery({
    queryKey: ["studio", "cohort-detail", selected?.id],
    enabled: !!selected,
    queryFn: async () =>
      (await api.get(`/studio/cohorts/${selected!.id}`)).data,
  });
  const canManageMembers = !!user && ["OWNER", "ADMIN"].includes(user.role);
  const members = useQuery({
    queryKey: ["admin", "members"],
    enabled: canManageMembers,
    queryFn: async () =>
      (
        await api.get<
          {
            id: string;
            role: string;
            user: { id: string; name: string; email: string };
          }[]
        >("/admin/members")
      ).data,
  });
  const save = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      editing?.id
        ? api.patch(`/studio/cohorts/${editing.id}`, data)
        : api.post("/studio/cohorts", data),
    onSuccess: () => {
      setEditing(null);
      setMessage("Cohort saved.");
      void qc.invalidateQueries({ queryKey: ["studio", "cohorts"] });
      void qc.invalidateQueries({ queryKey: ["studio", "cohort-detail"] });
    },
    onError: () =>
      setMessage("Could not save the cohort. Check the details and try again."),
  });
  const session = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post(`/studio/cohorts/${selected?.id}/sessions`, data),
    onSuccess: () => {
      setMessage("Session scheduled.");
      void qc.invalidateQueries({
        queryKey: ["studio", "cohort-detail", selected?.id],
      });
    },
    onError: () =>
      setMessage(
        "Could not schedule the session. Check the dates and try again.",
      ),
  });
  const assign = useMutation({
    mutationFn: () =>
      api.post(`/studio/cohorts/${selected?.id}/enrollments`, {
        userId: learnerId,
      }),
    onSuccess: () => {
      setLearnerId("");
      setMessage("Learner added to cohort.");
      void qc.invalidateQueries({
        queryKey: ["studio", "cohort-roster", selected?.id],
      });
    },
    onError: () => setMessage("Could not add this learner to the cohort."),
  });
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name")).trim();
    const startsAt = String(f.get("startsAt"));
    save.mutate({
      name,
      slug: String(f.get("slug")).trim(),
      startsAt: new Date(startsAt).toISOString(),
      status: f.get("status"),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...(!editing?.id ? { courseId: f.get("courseId") } : {}),
    });
  }
  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--accent-2)]">
            Your teaching calendar
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Cohorts</h1>
          <p className="mt-2 text-[var(--muted)]">
            Bring learners together with a clear schedule and a shared course.
          </p>
        </div>
        <Button onClick={() => setEditing({})}>
          <Plus size={17} />
          Create cohort
        </Button>
      </header>
      {message && (
        <p
          role="status"
          className="rounded-lg border bg-[var(--surface)] p-4 text-sm"
        >
          {message}
        </p>
      )}
      {editing && (
        <form
          key={editing.id ?? "new"}
          onSubmit={submit}
          className="grid gap-4 rounded-xl border bg-[var(--surface)] p-6 sm:grid-cols-2"
        >
          <label className="text-sm">
            Cohort name
            <input
              name="name"
              required
              defaultValue={editing.name}
              className={field}
            />
          </label>
          <label className="text-sm">
            Cohort slug
            <input
              name="slug"
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              placeholder="autumn-study-group"
              defaultValue={editing.slug}
              className={field}
            />
          </label>
          <label className="text-sm">
            Course
            <select
              name="courseId"
              required
              disabled={!!editing.id}
              defaultValue={editing.courseId ?? courses.data?.[0]?.id}
              className={field}
            >
              {courses.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Starts (your local time)
            <input
              name="startsAt"
              required
              type="datetime-local"
              defaultValue={localDate(editing.startsAt)}
              className={field}
            />
          </label>
          <label className="text-sm">
            Status
            <select
              name="status"
              defaultValue={editing.status ?? "UPCOMING"}
              className={field}
            >
              {["UPCOMING", "ACTIVE", "COMPLETED", "ARCHIVED"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap items-end gap-2">
            <Button type="submit" disabled={save.isPending}>
              Save cohort
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditing(null)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
      {cohorts.isError && (
        <p role="alert" className="text-sm text-[var(--danger)]">
          Could not load cohorts.{" "}
          <button className="underline" onClick={() => void cohorts.refetch()}>
            Try again
          </button>
        </p>
      )}
      <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <section className="space-y-3" aria-label="Cohort list">
          {cohorts.isLoading && <p>Loading cohorts...</p>}
          {cohorts.data?.length === 0 && (
            <div className="empty-panel">
              Create your first cohort to plan a shared learning run.
            </div>
          )}
          {cohorts.data?.map((c) => (
            <article
              key={c.id}
              className={`rounded-xl border p-5 ${selected?.id === c.id ? "border-[var(--accent)] bg-[var(--surface-2)]" : "bg-[var(--surface)]"}`}
            >
              <button
                className="w-full text-left"
                onClick={() => setSelectedId(c.id)}
              >
                <span className="text-sm text-[var(--muted)]">{c.status}</span>
                <h2 className="mt-2 text-lg font-semibold">{c.name}</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {c.course?.title ??
                    courses.data?.find((course) => course.id === c.courseId)
                      ?.title}
                </p>
              </button>
              <button
                onClick={() => setEditing(c)}
                className="mt-4 flex items-center gap-2 text-sm text-[var(--accent)]"
              >
                <Pencil size={15} />
                Edit cohort
              </button>
            </article>
          ))}
        </section>
        <section className="min-w-0 space-y-6 rounded-xl border bg-[var(--surface)] p-5 sm:p-6">
          {!selected ? (
            <p className="text-sm text-[var(--muted)]">
              Select a cohort to manage its calendar and learners.
            </p>
          ) : (
            <>
              <div>
                <h2 className="text-2xl font-medium">{selected.name}</h2>
                <p className="mt-2 flex items-center gap-2 text-sm text-[var(--muted)]">
                  <Users size={16} />
                  {roster.data?.length ?? 0} learners
                </p>
              </div>
              <CohortTimeline cohort={detail.data} />
              <form
                className="grid gap-3 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  const startsAt = new Date(String(f.get("startsAt")));
                  const endsAt = new Date(String(f.get("endsAt")));
                  if (endsAt <= startsAt) {
                    setMessage("The session end must be after its start.");
                    return;
                  }
                  session.mutate({
                    title: f.get("title"),
                    startsAt: startsAt.toISOString(),
                    endsAt: endsAt.toISOString(),
                    ...(f.get("meetingUrl")
                      ? { meetingUrl: f.get("meetingUrl") }
                      : {}),
                  });
                }}
              >
                <h3 className="flex items-center gap-2 font-medium sm:col-span-2">
                  <CalendarPlus size={18} />
                  Schedule a session
                </h3>
                <label className="text-sm sm:col-span-2">
                  Session title
                  <input required name="title" className={field} />
                </label>
                <label className="text-sm">
                  Starts (local time)
                  <input
                    required
                    type="datetime-local"
                    name="startsAt"
                    className={field}
                  />
                </label>
                <label className="text-sm">
                  Ends (local time)
                  <input
                    required
                    type="datetime-local"
                    name="endsAt"
                    className={field}
                  />
                </label>
                <label className="text-sm sm:col-span-2">
                  Meeting link (optional)
                  <input
                    type="url"
                    name="meetingUrl"
                    placeholder="https://"
                    className={field}
                  />
                </label>
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={session.isPending}
                >
                  Schedule
                </Button>
              </form>
              <div className="border-t pt-5">
                <h3 className="font-medium">Learners</h3>
                {roster.isError && (
                  <p className="mt-3 text-sm text-[var(--danger)]">
                    Could not load the roster.
                  </p>
                )}
                <ul className="mt-3 space-y-2">
                  {roster.data?.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-lg bg-[var(--surface-2)] p-3 text-sm"
                    >
                      <p className="font-medium">{r.user.name}</p>
                      <p className="break-all text-[var(--muted)]">
                        {r.user.email}
                      </p>
                    </li>
                  ))}
                </ul>
                {canManageMembers && (
                  <form
                    className="mt-4 flex flex-wrap gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (learnerId) assign.mutate();
                    }}
                  >
                    <label className="min-w-0 flex-1">
                      <span className="sr-only">Select learner</span>
                      <select
                        required
                        value={learnerId}
                        onChange={(e) => setLearnerId(e.target.value)}
                        className={field}
                      >
                        <option value="">Select learner</option>
                        {members.data
                          ?.filter(
                            (m) =>
                              m.role === "LEARNER" &&
                              !roster.data?.some(
                                (r) => r.user.id === m.user.id,
                              ),
                          )
                          .map((m) => (
                            <option key={m.id} value={m.user.id}>
                              {m.user.name}
                            </option>
                          ))}
                      </select>
                    </label>
                    <Button
                      type="submit"
                      size="sm"
                      className="mt-2"
                      disabled={!learnerId || assign.isPending}
                    >
                      Add learner
                    </Button>
                  </form>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
