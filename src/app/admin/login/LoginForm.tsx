"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
        return;
      }

      toast.success("Welcome back");
      router.push(callbackUrl);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-white/10 bg-carbon p-8 shadow-2xl">
      <div className="mb-8 flex justify-center">
        <Logo href={undefined} variant="default" imageClassName="max-w-[160px] brightness-0 invert" />
      </div>
      <h1 className="mb-2 text-center text-2xl font-bold text-pure-paper">Admin Sign In</h1>
      <p className="mb-8 text-center text-sm text-chrome-mid">
        DPM Custom Prints administration portal
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-chrome-light">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-md border border-white/10 bg-ink-black px-4 py-2.5 text-pure-paper placeholder:text-chrome-mid focus:border-royal-blue focus:outline-none focus:ring-1 focus:ring-royal-blue"
            placeholder="admin@example.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-deep-magenta">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-chrome-light">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-md border border-white/10 bg-ink-black px-4 py-2.5 text-pure-paper placeholder:text-chrome-mid focus:border-royal-blue focus:outline-none focus:ring-1 focus:ring-royal-blue"
            placeholder="••••••••"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-deep-magenta">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
