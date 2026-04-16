"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { useAuth } from "@/components/auth/auth-provider";
import { authApi, getApiErrorMessage } from "@/lib/api";
import { notifyError, notifySuccess } from "@/lib/notify";
import { loginSchema, type LoginFormValues } from "@/lib/validations";

export function LoginForm({
  reason,
  next = "/products",
}: {
  reason?: string;
  next?: string;
}) {
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await authApi.login(values);
      await login({ token: response.accessToken, user: response.user });
      notifySuccess("Welcome back", "You have signed in successfully.");
      router.replace(next);
    } catch (error) {
      notifyError("Unable to sign in", getApiErrorMessage(error, "Please try again."));
    }
  });

  return (
    <AuthShell
      title="Sign in"
      description="Use your marketplace account to manage products and continue with purchases."
      redirectTo={next}
      alternateHref="/register"
      alternateLabel="Need an account? Create one"
    >
      {reason === "session-expired" && (
        <div className="mb-5 border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          Your session expired. Sign in again to continue.
        </div>
      )}

      <form className="space-y-5" onSubmit={onSubmit}>
        
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="jane@example.com"
            className="w-full border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-rose-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <Link href="/register" className="text-xs text-slate-500 hover:text-slate-900">
              Create account
            </Link>
          </div>

          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            className="w-full border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-rose-600">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-slate-900 disabled:opacity-50"
        >
          <LogIn className="size-4" />
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>

      </form>
    </AuthShell>
  );
}
