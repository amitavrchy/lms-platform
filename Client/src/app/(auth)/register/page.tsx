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
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
  organizationName: z.string().min(2).optional().or(z.literal("")),
  organizationSlug: z.string().min(2).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    register,
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
    try {
      const payload = {
        name: values.name,
        email: values.email,
        password: values.password,
        ...(values.organizationName
          ? { organizationName: values.organizationName }
          : { organizationSlug: values.organizationSlug || "learnora" }),
      };
      const { data } = await api.post("/auth/register", payload);
      localStorage.setItem("learnora_access_token", data.accessToken);
      localStorage.setItem("learnora_refresh_token", data.refreshToken);
      dispatch(setUser(mapAuthPayload(data)));
      toast.success("Academy ready — let's learn");
      router.push("/learn");
    } catch {
      toast.error("Could not create account");
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
        <h1 className="mt-6 text-[24px] font-semibold">Create your account</h1>
        <p className="mt-2 text-[14px] text-[var(--muted)]">
          Join an academy or start your own.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="mt-1 text-[14px] text-[var(--danger)]">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="mt-1 text-[14px] text-[var(--danger)]">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="mt-1 text-[14px] text-[var(--danger)]">{errors.password.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="organizationSlug">Join academy slug</Label>
            <Input id="organizationSlug" placeholder="learnora" {...register("organizationSlug")} />
          </div>
          <div>
            <Label htmlFor="organizationName">Or create academy name</Label>
            <Input id="organizationName" placeholder="My Academy" {...register("organizationName")} />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-[14px] text-[var(--muted)]">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--accent-2)] hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
