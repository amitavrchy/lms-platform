"use client";

import Link from "next/link";
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
];

export function LearnShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const hydrated = useAppSelector((s) => s.auth.hydrated);
  const canStudio = user && ["OWNER", "ADMIN", "INSTRUCTOR"].includes(user.role);
  const canAdmin = user && ["OWNER", "ADMIN"].includes(user.role);

  if (hydrated && !user) {
    router.replace("/login");
  }

  return (
    <div className="flex min-h-full bg-[var(--bg)]">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] p-4 md:flex">
        <Link href="/learn" className="mb-8 px-2 font-[family-name:var(--font-display)] text-[22px] font-bold">
          Learn<span className="text-[var(--accent)]">ora</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/learn" && pathname.startsWith(href));
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
          <p className="truncate px-2 text-[14px] text-[var(--muted)]">{user?.role}</p>
          <div className="mt-3 flex gap-2">
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
          <Link href="/learn" className="font-[family-name:var(--font-display)] text-[18px] font-bold">
            Learn<span className="text-[var(--accent)]">ora</span>
          </Link>
          <span className="text-[14px] text-[var(--muted)]">{user?.name}</span>
        </header>
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex-1 p-5 md:p-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
