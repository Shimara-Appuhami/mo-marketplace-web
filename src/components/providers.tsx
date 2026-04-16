"use client";

import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/components/auth/auth-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "16px",
            background: "#111827",
            color: "#f9fafb",
          },
        }}
      />
    </AuthProvider>
  );
}
