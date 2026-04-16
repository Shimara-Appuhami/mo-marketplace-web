"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { useAuth } from "@/components/auth/auth-provider";
import { authApi, getApiErrorMessage } from "@/lib/api";
import { notifyError, notifySuccess } from "@/lib/notify";
import { registerSchema, type RegisterFormValues } from "@/lib/validations";

export function RegisterForm({ next = "/products" }: { next?: string }) {
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await authApi.register(values);
      await login({ token: response.accessToken, user: response.user });
      notifySuccess("Account created", "Your account is ready to use.");
      router.replace(next);
    } catch (error) {
      notifyError("Unable to create account", getApiErrorMessage(error, "Please try again."));
    }
  });

  return (
    <AuthShell
      title="Create account"
      description="Register with your name, email, and password to access protected marketplace actions."
      redirectTo={next}
      alternateHref="/login"
      alternateLabel="Already have an account? Sign in"
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Jane Doe"
            className="w-full border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
            {...register("name")}
          />
          {errors.name && <p className="text-xs text-rose-600">{errors.name.message}</p>}
        </div>

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
          {errors.email && <p className="text-xs text-rose-600">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="At least 8 characters"
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
          <UserPlus className="size-4" />
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>

      </form>
    </AuthShell>
  );
}
