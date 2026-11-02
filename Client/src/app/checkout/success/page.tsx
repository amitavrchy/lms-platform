import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg)] p-5">
      <section className="max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-[var(--success)]" />
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-[28px] font-bold">You&apos;re ready to learn</h1>
        <p className="mt-3 text-[14px] leading-6 text-[var(--muted)]">Your access is being confirmed. It may take a moment for the course to appear in your learning dashboard.</p>
        <Link href="/learn" className="mt-6 inline-flex rounded-xl bg-[var(--accent)] px-5 py-3 text-[14px] font-medium text-white">Go to learning</Link>
      </section>
    </main>
  );
}
