"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function AcademicMarkdown({
  children,
  className,
}: {
  children?: string | null;
  className?: string;
}) {
  return (
    <div className={cn("academic-markdown text-[15px] leading-7 text-[var(--text)]", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="mb-4 text-[24px] font-bold tracking-tight">{children}</h1>,
          h2: ({ children }) => <h2 className="mb-3 mt-7 text-[20px] font-semibold">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-2 mt-5 text-[16px] font-semibold">{children}</h3>,
          p: ({ children }) => <p className="my-3">{children}</p>,
          a: ({ children, href }) => <a href={href} className="text-[var(--accent-2)] underline underline-offset-4">{children}</a>,
          blockquote: ({ children }) => (
            <blockquote className="my-4 flex gap-3 rounded-r-xl border-l-2 border-[var(--accent)] bg-[var(--surface-2)] px-4 py-3 text-[var(--muted)]">
              <Info className="mt-1 h-4 w-4 shrink-0 text-[var(--accent-2)]" /> <span>{children}</span>
            </blockquote>
          ),
          li: ({ children, className, ...props }) => {
            const checked = (props as { checked?: boolean }).checked;
            return (
              <li className={cn("my-1", checked !== undefined && "flex items-center gap-2 list-none", className)}>
                {checked !== undefined && <CheckCircle2 className={cn("h-4 w-4 shrink-0", checked ? "text-[var(--success)]" : "text-[var(--muted)]")} />}
                {children}
              </li>
            );
          },
          input: () => null,
          code: ({ children }) => <code className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[13px]">{children}</code>,
        }}
      >
        {children || "_No lesson notes are available yet._"}
      </ReactMarkdown>
    </div>
  );
}
