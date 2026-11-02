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
    <div
      className={cn(
        "academic-markdown text-[15px] leading-7 text-[var(--text)]",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2 className="mb-4 text-[24px] font-bold tracking-tight">
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-7 text-[20px] font-semibold">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-5 text-[16px] font-semibold">{children}</h3>
          ),
          p: ({ children }) => <p className="my-3">{children}</p>,
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-[var(--accent-2)] underline underline-offset-4"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-4 flex gap-3 rounded-r-xl border-l-2 border-[var(--accent)] bg-[var(--surface-2)] px-4 py-3 text-[var(--muted)]">
              <Info className="mt-1 h-4 w-4 shrink-0 text-[var(--accent-2)]" />{" "}
              <div>{children}</div>
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="my-3 list-disc space-y-1 pl-5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 list-decimal space-y-1 pl-5">{children}</ol>
          ),
          table: ({ children }) => (
            <div className="my-5 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border bg-[var(--surface-2)] px-3 py-2 font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border px-3 py-2">{children}</td>
          ),
          li: ({ children, className, ...props }) => {
            const checked = (props as { checked?: boolean }).checked;
            return (
              <li
                className={cn(
                  "my-1",
                  checked !== undefined && "flex items-center gap-2 list-none",
                  className,
                )}
              >
                {checked !== undefined && (
                  <CheckCircle2
                    className={cn(
                      "h-4 w-4 shrink-0",
                      checked ? "text-[var(--success)]" : "text-[var(--muted)]",
                    )}
                  />
                )}
                {children}
              </li>
            );
          },
          input: () => null,
          code: ({ children }) => (
            <code className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[13px]">
              {children}
            </code>
          ),
        }}
      >
        {children || "_No lesson notes are available yet._"}
      </ReactMarkdown>
    </div>
  );
}
