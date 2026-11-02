import Link from "next/link";
import { BookOpen, ArrowUpRight } from "lucide-react";
import { MarketingNav } from "@/components/layout/MarketingNav";
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketing flex min-h-screen flex-col">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <MarketingNav />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <footer className="marketing-footer">
        <div className="site-container">
          <div className="grid gap-10 py-14 md:grid-cols-[2fr_1fr_1fr_1fr]">
            <div>
              <Link href="/" className="brand">
                <span className="brand-mark">
                  <BookOpen size={23} />
                </span>
                learnora<span className="brand-dot">.</span>
              </Link>
              <p className="mt-5 max-w-xs text-sm leading-7 text-[var(--muted)]">
                A little more understanding.
                <br />A little more progress. Every day.
                <br />
                Make room for the learner in you.
              </p>
            </div>
            <div>
              <h2 className="footer-heading">Discover</h2>
              <Link href="/courses">All courses</Link>
              <Link href="/courses?category=Research">Research skills</Link>
              <Link href="/courses?category=Study+%26+wellbeing">
                Study & wellbeing
              </Link>
            </div>
            <div>
              <h2 className="footer-heading">Your learning</h2>
              <Link href="/learn">Learning workspace</Link>
              <Link href="/learn/cohorts">Your cohort</Link>
              <Link href="/learn/certificates">Certificates</Link>
            </div>
            <div>
              <h2 className="footer-heading">Learnora</h2>
              <Link href="/#experience">How it works</Link>
              <Link href="/pricing">For academies</Link>
              <Link href="/#faq">Help & FAQs</Link>
              <Link href="/register" className="inline-flex items-center gap-1">
                Join the classroom <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap justify-between gap-3 border-t py-6 text-sm text-[var(--muted)]">
            <p>&copy; 2026 Learnora. Keep moving forward.</p>
            <p>Thoughtful courses. Meaningful progress.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
