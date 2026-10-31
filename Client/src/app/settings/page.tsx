"use client";

import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTheme } from "@/features/uiSlice";
import { LearnShell } from "@/components/layout/LearnShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const user = useAppSelector((s) => s.auth.user);
  const theme = useAppSelector((s) => s.ui.theme);
  const dispatch = useAppDispatch();

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
          <h2 className="text-[16px] font-semibold">Billing</h2>
          <p className="mt-2 text-[14px] text-[var(--muted)]">
            Stripe checkout stub — connect keys in env when ready.
          </p>
        </section>
      </div>
    </LearnShell>
  );
}
