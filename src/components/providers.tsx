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
          duration: 3600,
        }}
        gutter={12}
        containerStyle={{ top: 24, right: 24 }}
      />
    </AuthProvider>
  );
}
