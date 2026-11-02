"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  Flame,
  Home,
  LogOut,
  Settings,
  Award,
  Clapperboard,
  Shield,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/features/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/learn", label: "Home", icon: Home },
  { href: "/courses", label: "Catalog", icon: BookOpen },
  { href: "/learn/streak", label: "Streak", icon: Flame },
  { href: "/learn/certificates", label: "Certificates", icon: Award },
  { href: "/learn/cohorts", label: "Cohort", icon: Users },
];

export function LearnShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const user = useAppSelector((s) => s.auth.user);
  const hydrated = useAppSelector((s) => s.auth.hydrated);
  const canStudio =
    user && ["OWNER", "ADMIN", "INSTRUCTOR"].includes(user.role);
  const canAdmin = user && ["OWNER", "ADMIN"].includes(user.role);

  useEffect(() => {
    if (hydrated && !user)
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [hydrated, user, pathname, router]);
  if (!hydrated || !user)
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[var(--muted)]">
        Opening your learning workspace…
      </div>
    );

  return (
    <div className="flex min-h-full bg-[var(--bg)]">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] p-4 md:flex">
        <Link
          href="/learn"
          className="mb-8 px-2 font-[family-name:var(--font-display)] text-[22px] font-bold"
        >
          Learn<span className="text-[var(--accent)]">ora</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/learn" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition",
                  active
                    ? "bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] text-[var(--text)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
          {canStudio && (
            <Link
              href="/studio"
              className={cn(
                "mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition",
                pathname.startsWith("/studio")
                  ? "bg-[color-mix(in_oklab,var(--accent)_18%,transparent)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]",
              )}
            >
              <Clapperboard className="h-4 w-4" />
              Studio
            </Link>
          )}
          {canAdmin && (
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition",
                pathname.startsWith("/admin")
                  ? "bg-[color-mix(in_oklab,var(--accent)_18%,transparent)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]",
              )}
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>
        <div className="border-t border-[var(--border)] pt-4">
          <p className="truncate px-2 text-[14px] font-medium">{user?.name}</p>
          <p className="truncate px-2 text-[14px] text-[var(--muted)]">
            {user?.role}
          </p>
          <div className="mt-3 flex gap-2">
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
        <header className="hidden h-20 shrink-0 items-center border-b border-[var(--border)] bg-[var(--surface)] md:flex">
          <div className="site-container flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--muted)]">{user.orgName}</p>
              <p className="text-sm font-semibold">Your learning workspace</p>
            </div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm"
            >
              <BookOpen size={16} /> Find your next course
            </Link>
          </div>
        </header>
        <header className="flex h-14 items-center justify-between border-b border-[var(--border)] px-4 md:hidden">
          <Link
            href="/learn"
            className="font-[family-name:var(--font-display)] text-[18px] font-bold"
          >
            Learn<span className="text-[var(--accent)]">ora</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-2 text-[14px] text-[var(--muted)]"
          >
            <Settings size={17} />
            {user?.name}
          </Link>
        </header>
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="workspace-content min-w-0 flex-1"
        >
          {children}
        </motion.main>
        <nav
          aria-label="Learning navigation"
          className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_94%,transparent)] px-2 py-2 backdrop-blur-xl md:hidden"
        >
          {links.slice(0, 5).map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/learn" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-12 flex-col items-center gap-1 rounded-lg px-2 py-1 text-[14px]",
                  active ? "text-[var(--accent-2)]" : "text-[var(--muted)]",
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
