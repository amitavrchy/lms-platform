"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Award, BookOpen, CheckCircle2, PlayCircle, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const journey = [
    { number: "01", title: "Enter a considered curriculum", body: "Short, structured lessons with a clear academic through-line—not an infinite content feed.", icon: BookOpen },
    { number: "02", title: "Practise in public", body: "Join a named cohort for live critique, study rhythm, and accountability when the material gets demanding.", icon: Users },
    { number: "03", title: "Leave with evidence", body: "Complete assessments, build momentum, and earn a record of the work you finished.", icon: Award },
  ];
  return (
    <>
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
          Serious learning, designed to be finished.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-4 max-w-xl text-[16px] text-[var(--muted)]"
        >
          Learnora combines rigorous courses, live cohorts, and a course-grounded study companion into one focused academic home.
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
          Built for deliberate practice · Cohort-led · Assessment-aware
        </motion.div>
      </div>
    </section>
    <section className="border-y border-[var(--border)] bg-[var(--surface)]/50">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-7 text-center sm:grid-cols-3">
        <p className="text-[14px] text-[var(--muted)]"><strong className="block text-[20px] text-[var(--text)]">Live cohorts</strong>Study alongside people who show up</p>
        <p className="text-[14px] text-[var(--muted)]"><strong className="block text-[20px] text-[var(--text)]">Purposeful pace</strong>Lessons, practice, reflection and review</p>
        <p className="text-[14px] text-[var(--muted)]"><strong className="block text-[20px] text-[var(--text)]">Verifiable progress</strong>Assessments and certificates when earned</p>
      </div>
    </section>
    <section className="mx-auto max-w-6xl px-5 py-20">
      <p className="text-[14px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-2)]">The learning journey</p>
      <h2 className="mt-3 max-w-2xl text-[32px] font-bold sm:text-[42px]">A platform that respects the work it takes to understand something.</h2>
      <div className="mt-10 grid gap-4 md:grid-cols-3">{journey.map(({ number, title, body, icon: Icon }) => <article key={number} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"><div className="flex items-center justify-between"><span className="text-[14px] font-semibold text-[var(--accent-2)]">{number}</span><Icon className="h-5 w-5 text-[var(--accent)]" /></div><h3 className="mt-10 text-[20px] font-semibold">{title}</h3><p className="mt-3 text-[14px] leading-6 text-[var(--muted)]">{body}</p></article>)}</div>
    </section>
    <section className="learnora-grid border-y border-[var(--border)] px-5 py-20"><div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2"><div><p className="text-[14px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-2)]">Academic support, on demand</p><h2 className="mt-3 text-[32px] font-bold sm:text-[42px]">A study companion that stays inside the course.</h2><p className="mt-4 max-w-xl text-[16px] text-[var(--muted)]">Ask for an explanation, a practice question, or a useful connection. Learnora’s tutor is grounded in your enrolled material—so support remains relevant and trustworthy.</p><ul className="mt-7 space-y-3 text-[14px]">{["Lesson-specific context and resources", "Assessment preparation without shortcuts", "Focus tools for the session you are in"].map(item => <li key={item} className="flex gap-2"><CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--success)]" />{item}</li>)}</ul></div><div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6"><p className="text-[14px] text-[var(--muted)]">Ask your study companion</p><div className="mt-4 rounded-2xl bg-[var(--surface-2)] p-4 text-[14px]">How does spaced retrieval differ from simply re-reading a chapter?</div><div className="mt-4 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-4 text-[14px] leading-6">Re-reading feels familiar, but retrieval requires you to reconstruct the idea. In this module, try the checkpoint questions after you close the notes.</div><p className="mt-4 text-[14px] text-[var(--muted)]">Grounded in Module 3 materials</p></div></div></section>
    <section className="mx-auto max-w-6xl px-5 py-20 text-center"><p className="text-[14px] font-semibold text-[var(--accent-2)]">Cohorts with a point of view</p><h2 className="mx-auto mt-3 max-w-2xl text-[32px] font-bold sm:text-[42px]">The accountability of a classroom, without the clutter.</h2><p className="mx-auto mt-4 max-w-xl text-[16px] text-[var(--muted)]">Cohorts make the calendar visible: live sessions, teaching-team announcements, shared milestones and a reason to return.</p><Link href="/courses" className="mt-8 inline-block"><Button size="lg">Explore the curriculum <ArrowRight className="h-4 w-4" /></Button></Link></section>
    </>
  );
}
