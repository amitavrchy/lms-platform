"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[var(--accent)]/25 blur-3xl"
          animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[var(--accent-2)]/15 blur-3xl"
          animate={{ opacity: [0.2, 0.4, 0.2], y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center px-5 py-16">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-5 font-[family-name:var(--font-display)] text-[42px] font-bold leading-none tracking-tight sm:text-[64px] md:text-[80px]"
        >
          Learn<span className="text-[var(--accent)]">ora</span>
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="max-w-2xl text-[28px] font-semibold leading-tight text-[var(--text)] sm:text-[36px]"
        >
          Finish what you start.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-4 max-w-xl text-[16px] text-[var(--muted)]"
        >
          Beautiful lessons, streak-powered habits, and an AI tutor that only knows your course —
          so every session ends closer to done.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <Link href="/register">
            <Button size="lg">
              Start learning free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/courses">
            <Button size="lg" variant="secondary">
              Browse catalog
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-10 inline-flex items-center gap-2 text-[14px] text-[var(--muted)]"
        >
          <Sparkles className="h-4 w-4 text-[var(--xp)]" />
          Streaks · XP · Certificates · Grounded AI tutor
        </motion.div>
      </div>
    </section>
  );
}
