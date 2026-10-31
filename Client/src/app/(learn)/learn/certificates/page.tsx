"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { Badge } from "@/components/ui/badge";

type Cert = {
  id: string;
  code: string;
  issuedAt: string;
  course: { id: string; title: string; slug: string };
};

export default function CertificatesPage() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.certificates,
    queryFn: async () => (await api.get<Cert[]>("/me/certificates")).data,
  });

  return (
    <div className="mx-auto max-w-3xl">
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-[family-name:var(--font-display)] text-[32px] font-bold"
      >
        Certificates
      </motion.h1>
      <p className="mt-2 text-[16px] text-[var(--muted)]">
        Earned when you finish every lesson in a course.
      </p>

      <div className="mt-8 space-y-4">
        {isLoading && <div className="h-28 animate-pulse rounded-2xl bg-[var(--surface)]" />}
        {data?.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--xp)_20%,transparent)]">
              <Award className="h-6 w-6 text-[var(--xp)]" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-[16px] font-semibold">{c.course.title}</h2>
              <p className="text-[14px] text-[var(--muted)]">
                Issued {new Date(c.issuedAt).toLocaleDateString()}
              </p>
            </div>
            <Link href={`/learn/certificates/${c.code}`}>
              <Badge tone="xp">{c.code}</Badge>
            </Link>
          </motion.div>
        ))}
        {!isLoading && data?.length === 0 && (
          <p className="text-[14px] text-[var(--muted)]">No certificates yet — finish a course.</p>
        )}
      </div>
    </div>
  );
}
