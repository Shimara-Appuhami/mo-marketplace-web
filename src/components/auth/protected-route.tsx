"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle, Lock } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

export function ProtectedRoute({
  children,
  title = "Checking your session",
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const { isAuthenticated, isReady } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isReady || isAuthenticated) {
      return;
    }

    const params = new URLSearchParams({ next: pathname });
    router.replace(`/login?${params.toString()}`);
  }, [isAuthenticated, isReady, pathname, router]);

  if (!isReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
          <LoaderCircle className="size-4 animate-spin" />
          <span>{title}</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-700 shadow-sm">
          <Lock className="size-4" />
          <span>Redirecting to login...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
