"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, BookOpen, Menu, X } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
const links = [
  { href: "/courses", label: "Explore courses" },
  { href: "/#experience", label: "The experience" },
  { href: "/pricing", label: "For academies" },
  { href: "/#faq", label: "FAQs" },
];
export function MarketingNav() {
  const user = useAppSelector((s) => s.auth.user);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="marketing-header">
      <div className="site-container flex h-20 items-center justify-between gap-5">
        <Link href="/" className="brand" aria-label="Learnora home">
          <span className="brand-mark">
            <BookOpen size={23} strokeWidth={1.8} />
          </span>
          learnora<span className="brand-dot">.</span>
        </Link>
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 text-sm lg:flex"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className="nav-link"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-5">
          <Link
            href={user ? "/learn" : "/login"}
            className="hidden text-sm font-medium sm:block"
          >
            {user ? "My learning" : "Log in"}
          </Link>
          <Link
            href={user ? "/learn" : "/register"}
            className="action-link compact"
          >
            {user ? "Go to workspace" : "Start learning"}
            <ArrowUpRight size={17} />
          </Link>
          <button
            type="button"
            className="grid size-10 place-items-center lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="site-container grid gap-1 border-t py-4 lg:hidden"
        >
          {[
            ...links,
            {
              href: user ? "/learn" : "/login",
              label: user ? "My learning" : "Log in",
            },
            ...(!user ? [{ href: "/register", label: "Start learning" }] : []),
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-sm hover:bg-[var(--surface-2)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
