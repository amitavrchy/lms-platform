import { MarketingNav } from "@/components/layout/MarketingNav";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col learnora-grid">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-[var(--border)] py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 text-[14px] text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p className="font-[family-name:var(--font-display)] text-[16px] font-semibold text-[var(--text)]">
            Learn<span className="text-[var(--accent)]">ora</span>
          </p>
          <p>Finish what you start.</p>
        </div>
      </footer>
    </div>
  );
}
