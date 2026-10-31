"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export function StreakFlame({
  streak,
  className,
}: {
  streak: number;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <motion.span
        animate={{ scale: [1, 1.12, 1], rotate: [0, -4, 4, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--accent-2)_18%,transparent)]"
      >
        <Flame className="h-5 w-5 text-[var(--accent-2)]" fill="currentColor" />
      </motion.span>
      <div>
        <p className="text-[14px] font-semibold text-[var(--text)]">{streak} day streak</p>
        <p className="text-[14px] text-[var(--muted)]">Keep the flame alive</p>
      </div>
    </div>
  );
}
