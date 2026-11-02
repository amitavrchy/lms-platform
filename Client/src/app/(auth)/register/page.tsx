"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { mapAuthPayload } from "@/lib/auth-map";
import { setUser } from "@/features/authSlice";
import { useAppDispatch } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
  organizationName: z.string().min(2).optional().or(z.literal("")),
  organizationSlug: z.string().min(2).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [creating, setCreating] = useState(
    searchParams.get("mode") === "academy",
  );
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  function destination() {
    const next = new URLSearchParams(window.location.search).get("next");
    return next &&
      next.startsWith("/") &&
      !next.startsWith("//") &&
      !next.includes("\\")
      ? next
      : "/learn";
  }
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      organizationName: "",
      organizationSlug: "learnora",
    },
  });

  async function onSubmit(values: FormValues) {
    if (creating && !values.organizationName?.trim()) {
      toast.error("Enter a name for your academy");
      return;
    }
    try {
      const payload = {
        name: values.name,
        email: values.email,
        password: values.password,
        ...(creating
          ? { organizationName: values.organizationName }
          : { organizationSlug: values.organizationSlug || "learnora" }),
      };
      const { data } = await api.post("/auth/register", payload);
      localStorage.setItem("learnora_access_token", data.accessToken);
      localStorage.setItem("learnora_refresh_token", data.refreshToken);
      queryClient.clear();
      dispatch(setUser(mapAuthPayload(data)));
      toast.success("Academy ready — let's learn");
      router.push(creating ? "/studio" : destination());
    } catch {
      toast.error("Could not create account");
    }
  }

  return (
    <div className="marketing relative flex min-h-screen flex-1 items-center justify-center px-5 py-16">
      <Link
        href="/"
        className="absolute left-[5%] top-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--text)]"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to home
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8"
      >
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-[24px] font-bold"
        >
          Learn<span className="text-[var(--accent)]">ora</span>
        </Link>
        <h1 className="mt-6 text-[24px] font-semibold">Create your account</h1>
        <p className="mt-2 text-[14px] text-[var(--muted)]">
          Join an academy or start your own.
        </p>

        <div className="mt-6 flex rounded-lg bg-[var(--surface-2)] p-1">
          {[false, true].map((mode) => (
            <button
              key={String(mode)}
              type="button"
              className={`flex-1 rounded-md px-3 py-2 text-sm ${creating === mode ? "bg-white shadow-sm" : "text-[var(--muted)]"}`}
              aria-pressed={creating === mode}
              onClick={() => {
                setCreating(mode);
                setValue("organizationName", "");
              }}
            >
              {mode ? "Create an academy" : "Join an academy"}
            </button>
          ))}
        </div>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="mt-1 text-[14px] text-[var(--danger)]">
                {errors.name.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="mt-1 text-[14px] text-[var(--danger)]">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="mt-1 text-[14px] text-[var(--danger)]">
                {errors.password.message}
              </p>
            )}
          </div>
          {!creating && (
            <div>
              <Label htmlFor="organizationSlug">Join academy slug</Label>
              <Input
                id="organizationSlug"
                placeholder="learnora"
                {...register("organizationSlug")}
              />
            </div>
          )}
          {creating && (
            <div>
              <Label htmlFor="organizationName">Academy name</Label>
              <Input
                id="organizationName"
                placeholder="My Academy"
                {...register("organizationName")}
              />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-[14px] text-[var(--muted)]">
          Already have an account?{" "}
          <Link
            href={
              searchParams.get("next")
                ? `/login?next=${encodeURIComponent(searchParams.get("next")!)}`
                : "/login"
            }
            className="text-[var(--accent-2)] hover:underline"
          >
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
