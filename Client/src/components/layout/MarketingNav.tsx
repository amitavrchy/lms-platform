"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";

export function MarketingNav() {
  const user = useAppSelector((s) => s.auth.user);

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_82%,transparent)] backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="font-[family-name:var(--font-display)] text-[20px] font-bold tracking-tight">
          Learn<span className="text-[var(--accent)]">ora</span>
        </Link>
        <nav className="hidden items-center gap-8 text-[14px] text-[var(--muted)] md:flex">
          <Link href="/courses" className="hover:text-[var(--text)] transition-colors">
            Courses
          </Link>
          <Link href="/pricing" className="hover:text-[var(--text)] transition-colors">
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Link href="/learn">
              <Button size="sm">Go to Learn</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Start free</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
