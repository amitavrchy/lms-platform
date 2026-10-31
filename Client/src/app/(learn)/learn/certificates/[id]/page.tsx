"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function CertificateViewPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isError } = useQuery({
    queryKey: ["certificate", id],
    queryFn: async () => (await api.get(`/certificates/${id}`)).data,
  });

  if (isError) {
    return <p className="text-[14px] text-[var(--danger)]">Certificate not found.</p>;
  }

  if (!data) {
    return <div className="h-64 animate-pulse rounded-2xl bg-[var(--surface)]" />;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-[var(--xp)]/40 bg-gradient-to-br from-[var(--surface)] to-[color-mix(in_oklab,var(--xp)_12%,var(--surface))] p-10 text-center"
      >
        <p className="font-[family-name:var(--font-display)] text-[20px] font-bold">
          Learn<span className="text-[var(--accent)]">ora</span>
        </p>
        <p className="mt-6 text-[14px] uppercase tracking-[0.2em] text-[var(--muted)]">
          Certificate of completion
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-[32px] font-bold">
          {data.learner}
        </h1>
        <p className="mt-3 text-[16px] text-[var(--muted)]">
          completed <span className="text-[var(--text)]">{data.course}</span>
        </p>
        <p className="mt-2 text-[14px] text-[var(--muted)]">{data.organization}</p>
        <p className="mt-8 font-mono text-[14px] text-[var(--xp)]">{data.code}</p>
        <p className="mt-2 text-[14px] text-[var(--muted)]">
          Issued {new Date(data.issuedAt).toLocaleDateString()}
        </p>
        <Button
          className="mt-8"
          variant="secondary"
          onClick={() => navigator.clipboard.writeText(window.location.href)}
        >
          Copy share link
        </Button>
      </motion.div>
    </div>
  );
}
