"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, LogOut, Settings, Shield } from "lucide-react";
import { logout } from "@/features/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const hydrated = useAppSelector((s) => s.auth.hydrated);
  const canAdmin = user && ["OWNER", "ADMIN"].includes(user.role);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    return () => document.documentElement.removeAttribute("data-theme");
  }, []);

  useEffect(() => {
    if (hydrated && !user) router.replace("/login");
    else if (hydrated && user && !canAdmin) router.replace("/learn");
  }, [hydrated, user, canAdmin, router]);


  return (
    <div className="flex min-h-full bg-[var(--bg)]">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] p-4 md:flex">
        <Link
          href="/admin"
          className="mb-1 flex items-center gap-2 px-2 font-[family-name:var(--font-display)] text-[22px] font-bold"
        >
          <Shield className="h-5 w-5 text-[var(--accent)]" />
          Admin
        </Link>
        <p className="mb-6 px-2 text-[14px] text-[var(--muted)]">
          Learn<span className="text-[var(--accent)]">ora</span> org
        </p>
        <nav aria-label="Admin navigation" className="flex flex-1 flex-col gap-1">
          <Link
            href="/admin"
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition ${
              pathname.startsWith("/admin")
                ? "bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] text-[var(--text)]"
                : "text-[var(--muted)] hover:bg-[var(--surface-2)]"
            }`}
          >
            <Shield className="h-4 w-4" />
            Members, seats & reports
          </Link>
        </nav>
        <div className="space-y-2 border-t border-[var(--border)] pt-4">
          <Link href="/learn">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <ArrowLeft className="h-4 w-4" />
              Back to learn
            </Button>
          </Link>
          <div className="flex gap-2">
            <Link href="/settings" className="flex-1">
              <Button variant="ghost" size="sm" className="w-full">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={() => {
                dispatch(logout());
                router.push("/login");
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-[var(--border)] px-4 md:hidden">
          <Link href="/admin" className="font-[family-name:var(--font-display)] text-[18px] font-bold">
            Admin
          </Link>
        </header>
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 p-5 md:p-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
