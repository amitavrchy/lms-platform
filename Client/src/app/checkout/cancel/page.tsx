import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg)] p-5">
      <section className="max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-[28px] font-bold">Checkout cancelled</h1>
        <p className="mt-3 text-[14px] leading-6 text-[var(--muted)]">No payment was made. You can return to the course when you&apos;re ready.</p>
        <Link href="/courses" className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-5 py-3 text-[14px] font-medium"><ArrowLeft className="h-4 w-4" /> Browse courses</Link>
      </section>
    </main>
  );
}
