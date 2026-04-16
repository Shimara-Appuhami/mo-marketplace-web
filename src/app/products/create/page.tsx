import { ProtectedRoute } from "@/components/auth/protected-route";

export default function CreateProductPage() {
  return (
    <ProtectedRoute title="Verifying access to create products">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-12 sm:px-6">
        <span className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
          Protected
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          Product creation will be added after the required flows.
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          This page is already protected by the auth guard. Unauthenticated visitors are
          redirected to the login page and returned here after signing in.
        </p>
      </section>
    </ProtectedRoute>
  );
}
