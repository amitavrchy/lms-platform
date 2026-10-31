"use client";

import { motion } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CompleteBar({
  completed,
  completing,
  onComplete,
  onNext,
  hasNext,
}: {
  completed: boolean;
  completing?: boolean;
  onComplete: () => void;
  onNext?: () => void;
  hasNext?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="text-[14px] text-[var(--muted)]">
        {completed ? "Lesson complete — nice work" : "Mark complete to earn +10 XP"}
      </div>
      <div className="flex gap-2">
        {!completed ? (
          <Button onClick={onComplete} disabled={completing}>
            <motion.span
              key="check"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              {completing ? "Saving…" : "Mark complete"}
            </motion.span>
          </Button>
        ) : (
          <Button variant="secondary" disabled>
            <Check className="h-4 w-4 text-[var(--success)]" />
            Completed
          </Button>
        )}
        {hasNext && onNext && (
          <Button variant="outline" onClick={onNext}>
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
