"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTheme } from "@/features/uiSlice";
import { LearnShell } from "@/components/layout/LearnShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const user = useAppSelector((s) => s.auth.user);
  const theme = useAppSelector((s) => s.ui.theme);
  const dispatch = useAppDispatch();
  const [preferences, setPreferences] = useState({ email: true, announcements: true, reminders: true });
  const preferenceQuery = useQuery({
    queryKey: ["me", "notification-preferences"],
    queryFn: async () => (await api.get("/me/notification-preferences")).data,
    retry: false,
  });
  const savePreferences = useMutation({
    mutationFn: () => api.patch("/me/notification-preferences", preferences),
    onSuccess: () => toast.success("Notification preferences saved"),
    onError: () => toast.error("Could not save preferences"),
  });
  useEffect(() => {
    const data = preferenceQuery.data;
    if (!data || typeof data !== "object") return;
    const source = ("preferences" in data && data.preferences && typeof data.preferences === "object" ? data.preferences : data) as Record<string, unknown>;
    setPreferences((current) => ({
      email: typeof source.email === "boolean" ? source.email : current.email,
      announcements: typeof source.announcements === "boolean" ? source.announcements : current.announcements,
      reminders: typeof source.reminders === "boolean" ? source.reminders : current.reminders,
    }));
  }, [preferenceQuery.data]);

  return (
    <LearnShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-[family-name:var(--font-display)] text-[32px] font-bold"
        >
          Settings
        </motion.h1>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-[16px] font-semibold">Profile</h2>
          <p className="mt-3 text-[14px]">{user?.name}</p>
          <p className="text-[14px] text-[var(--muted)]">{user?.email}</p>
          <div className="mt-3 flex gap-2">
            <Badge>{user?.role}</Badge>
            <Badge tone="accent">{user?.orgName}</Badge>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-[16px] font-semibold">Appearance</h2>
          <p className="mt-2 text-[14px] text-[var(--muted)]">
            Learner surfaces stay dark by default; studio/admin can use light.
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              variant={theme === "dark" ? "primary" : "secondary"}
              onClick={() => dispatch(setTheme("dark"))}
            >
              Dark
            </Button>
            <Button
              size="sm"
              variant={theme === "light" ? "primary" : "secondary"}
              onClick={() => dispatch(setTheme("light"))}
            >
              Light
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-[16px] font-semibold">Notifications</h2>
          <p className="mt-2 text-[14px] text-[var(--muted)]">Choose the academic updates that reach you.</p>
          <div className="mt-4 space-y-3">
            {([{ key: "email", label: "Email updates" }, { key: "announcements", label: "Cohort announcements" }, { key: "reminders", label: "Learning reminders" }] as const).map(({ key, label }) => (
              <label key={key} className="flex cursor-pointer items-center justify-between rounded-xl bg-[var(--surface-2)] px-4 py-3 text-[14px]">
                {label}
                <input type="checkbox" checked={preferences[key]} onChange={(event) => setPreferences((current) => ({ ...current, [key]: event.target.checked }))} className="h-4 w-4 accent-[var(--accent)]" />
              </label>
            ))}
          </div>
          <Button className="mt-4" size="sm" onClick={() => savePreferences.mutate()} disabled={savePreferences.isPending}>{savePreferences.isPending ? "Saving…" : "Save preferences"}</Button>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-[16px] font-semibold">Billing</h2>
          <p className="mt-2 text-[14px] text-[var(--muted)]">
            {preferenceQuery.error && typeof preferenceQuery.error === "object" && "response" in preferenceQuery.error && (preferenceQuery.error as { response?: { status?: number } }).response?.status === 503
              ? "Billing configuration is unavailable right now."
              : "Course access and entitlements are shown on each course page."}
          </p>
        </section>
      </div>
    </LearnShell>
  );
}
