"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { mapAuthPayload } from "@/lib/auth-map";
import { setUser } from "@/features/authSlice";
import { useAppDispatch } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "learner@learnora.dev", password: "Password123!" },
  });

  async function onSubmit(values: FormValues) {
    try {
      const { data } = await api.post("/auth/login", values);
      localStorage.setItem("learnora_access_token", data.accessToken);
      localStorage.setItem("learnora_refresh_token", data.refreshToken);
      dispatch(setUser(mapAuthPayload(data)));
      toast.success("Welcome back");
      router.push("/learn");
    } catch {
      toast.error("Invalid email or password");
    }
  }

  return (
    <div className="learnora-grid flex min-h-full flex-1 items-center justify-center px-5 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8"
      >
        <Link href="/" className="font-[family-name:var(--font-display)] text-[24px] font-bold">
          Learn<span className="text-[var(--accent)]">ora</span>
        </Link>
        <h1 className="mt-6 text-[24px] font-semibold">Welcome back</h1>
        <p className="mt-2 text-[14px] text-[var(--muted)]">Log in to continue your streak.</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <p className="mt-1 text-[14px] text-[var(--danger)]">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
            {errors.password && (
              <p className="mt-1 text-[14px] text-[var(--danger)]">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Log in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-[14px] text-[var(--muted)]">
          New here?{" "}
          <Link href="/register" className="text-[var(--accent-2)] hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
