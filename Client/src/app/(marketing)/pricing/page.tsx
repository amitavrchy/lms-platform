"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    price: "Free",
    blurb: "For indie creators launching their first academy.",
    features: ["1 academy", "Unlimited learners", "Quizzes & XP", "AI tutor (demo)"],
  },
  {
    name: "Pro",
    price: "$49",
    blurb: "For cohorts that need analytics and AI quiz generation.",
    features: ["Everything in Starter", "Curriculum builder", "Analytics + insights", "Certificates"],
    highlight: true,
  },
  {
    name: "Org",
    price: "Custom",
    blurb: "Multi-seat academies with admin reporting.",
    features: ["SSO-ready roles", "Seat reports", "Priority support", "White-label stretch"],
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-[family-name:var(--font-display)] text-[36px] font-bold tracking-tight">
          Simple pricing
        </h1>
        <p className="mt-3 max-w-xl text-[16px] text-[var(--muted)]">
          Start free. Upgrade when your academy needs deeper analytics and AI tooling.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className={`rounded-2xl border p-6 ${
              plan.highlight
                ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_10%,var(--surface))]"
                : "border-[var(--border)] bg-[var(--surface)]"
            }`}
          >
            <p className="text-[14px] font-medium text-[var(--muted)]">{plan.name}</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-[32px] font-bold">
              {plan.price}
              {plan.price.startsWith("$") && (
                <span className="text-[14px] font-normal text-[var(--muted)]"> /mo</span>
              )}
            </p>
            <p className="mt-2 text-[14px] text-[var(--muted)]">{plan.blurb}</p>
            <ul className="mt-6 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[14px]">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/register" className="mt-8 block">
              <Button className="w-full" variant={plan.highlight ? "primary" : "secondary"}>
                Get started
              </Button>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
