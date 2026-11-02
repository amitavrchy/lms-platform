"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  MessagesSquare,
  UsersRound,
  Clapperboard,
  LogOut,
  Settings,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/features/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/studio", label: "Courses", icon: BookOpen, exact: true },
  { href: "/studio/cohorts", label: "Cohorts", icon: UsersRound },
  { href: "/studio/community", label: "Community", icon: MessagesSquare },
  { href: "/studio/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/studio/ai", label: "AI", icon: Sparkles },
];

export function StudioShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const user = useAppSelector((s) => s.auth.user);
  const hydrated = useAppSelector((s) => s.auth.hydrated);
  const canStudio =
    user && ["OWNER", "ADMIN", "INSTRUCTOR"].includes(user.role);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    return () => {
      document.documentElement.removeAttribute("data-theme");
    };
  }, []);

  useEffect(() => {
    if (hydrated && !user) router.replace("/login");
    else if (hydrated && user && !canStudio) router.replace("/learn");
  }, [hydrated, user, canStudio, router]);

  return (
    <div className="flex min-h-full bg-[var(--bg)]">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] p-4 md:flex">
        <Link
          href="/studio"
          className="mb-1 flex items-center gap-2 px-2 font-[family-name:var(--font-display)] text-[22px] font-bold"
        >
          <Clapperboard className="h-5 w-5 text-[var(--accent)]" />
          Studio
        </Link>
        <p className="mb-6 px-2 text-[14px] text-[var(--muted)]">
          Learn<span className="text-[var(--accent)]">ora</span> builder
        </p>
        <nav className="flex flex-1 flex-col gap-1">
          {links.map(({ href, label, icon: Icon, exact }) => {
            const active = exact
              ? pathname === href || pathname.startsWith("/studio/courses")
              : pathname === href || pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition",
                  active
                    ? "bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] text-[var(--text)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
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
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                aria-label="Account settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              aria-label="Log out"
              onClick={() => {
                queryClient.clear();
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
        <header className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3 md:hidden">
          <Link
            href="/studio"
            className="font-[family-name:var(--font-display)] text-[18px] font-bold"
          >
            Studio
          </Link>
          <nav className="flex flex-wrap gap-3 text-[14px]">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-[var(--muted)] hover:text-[var(--text)]"
              >
                {label}
              </Link>
            ))}
          </nav>
        </header>
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="workspace-content min-w-0 flex-1"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
