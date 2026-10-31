import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "default",
  children,
}: {
  className?: string;
  tone?: "default" | "accent" | "success" | "danger" | "xp" | "cyan";
  children: React.ReactNode;
}) {
  const tones = {
    default: "bg-[var(--surface-2)] text-[var(--muted)]",
    accent: "bg-[color-mix(in_oklab,var(--accent)_22%,transparent)] text-[#c4b5fd]",
    success: "bg-[color-mix(in_oklab,var(--success)_22%,transparent)] text-[var(--success)]",
    danger: "bg-[color-mix(in_oklab,var(--danger)_22%,transparent)] text-[var(--danger)]",
    xp: "bg-[color-mix(in_oklab,var(--xp)_22%,transparent)] text-[var(--xp)]",
    cyan: "bg-[color-mix(in_oklab,var(--accent-2)_22%,transparent)] text-[var(--accent-2)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-1 text-[14px] font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
