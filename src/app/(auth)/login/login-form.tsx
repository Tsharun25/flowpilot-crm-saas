"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DEMO_ACCOUNTS } from "@/lib/demo-accounts";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function authenticate(
    provider: "credentials" | "demo",
    values: Record<string, string>,
  ) {
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn(provider, {
        ...values,
        redirect: false,
      });

      if (!result || !result.ok || result.error) {
        setError(
          result?.error && provider === "credentials"
            ? "Invalid email or password"
            : "Unable to sign in right now. Please try again.",
        );
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to sign in right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await authenticate("credentials", {
      email: String(formData.get("email")),
      password: String(formData.get("password")),
    });
  }

  async function handleDemoLogin(role: string) {
    await authenticate("demo", { role });
  }

  return (
    <div className="flow-sign-in space-y-5">
      {isLoading ? <p role="status" className="flow-form-progress">Opening your workspace…</p> : null}
      {error ? <p id="login-error" role="alert" className="flow-form-error">{error}</p> : null}
      <section aria-labelledby="demo-login-heading">
        <div className="flex items-center justify-between gap-3">
          <h2 id="demo-login-heading" className="font-semibold">Explore the live demo</h2>
          <span className="flow-demo-badge">Read-only</span>
        </div>

        <div className="mt-4 grid gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.role}
              type="button"
              disabled={isLoading}
              onClick={() => handleDemoLogin(account.role)}
              className="flow-role"
            >
              <span>
                <span className="block text-sm font-semibold">{account.label}</span>
                <span className="mt-0.5 block text-sm text-slate-600">{account.description}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
        <span className="h-px flex-1 bg-violet-100" />
        Or sign in with email
        <span className="h-px flex-1 bg-violet-100" />
      </div>

      <form
        method="post"
        onSubmit={handleSubmit}
        className="space-y-5"
        aria-busy={isLoading}
      >
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "login-error" : undefined}
          className="flow-field"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "login-error" : undefined}
          placeholder="••••••••"
          className="flow-field"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="flow-button w-full disabled:opacity-60"
      >
        {isLoading ? "Logging in..." : "Login"}
      </button>
      </form>
    </div>
  );
}
