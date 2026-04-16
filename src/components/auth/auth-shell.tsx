"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";

export function AuthShell({
  title,
  description,
  redirectTo,
  alternateHref,
  alternateLabel,
  children,
}: {
  title: string;
  description: string;
  redirectTo: string;
  alternateHref: string;
  alternateLabel: string;
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    router.replace(redirectTo);
  }, [isAuthenticated, redirectTo, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_45%,#e2e8f0_100%)] px-4 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.4)] backdrop-blur">
        <div className="mb-8 space-y-3">
          <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white">
            MO Marketplace
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            {title}
          </h1>
          <p className="text-sm leading-6 text-slate-600">{description}</p>
        </div>

        {children}

        <p className="mt-6 text-sm text-slate-500">
          <Link
            href={alternateHref}
            className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 transition hover:decoration-slate-900"
          >
            {alternateLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}
