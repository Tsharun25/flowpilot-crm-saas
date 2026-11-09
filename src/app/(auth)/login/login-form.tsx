"use client";

import { useRef, useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/demo-accounts";

export default function LoginForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function login(email: string, password: string) {
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || !result.ok || result.error) {
        setError(
          result?.error
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
    await login(String(formData.get("email")), String(formData.get("password")));
  }

  async function handleDemoLogin(email: string) {
    if (formRef.current) {
      const emailInput = formRef.current.elements.namedItem("email") as HTMLInputElement | null;
      const passwordInput = formRef.current.elements.namedItem("password") as HTMLInputElement | null;
      if (emailInput) emailInput.value = email;
      if (passwordInput) passwordInput.value = DEMO_PASSWORD;
    }
    await login(email, DEMO_PASSWORD);
  }

  return (
    <div className="space-y-6">
      <section aria-labelledby="demo-login-heading">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Instant access</p>
            <h2 id="demo-login-heading" className="mt-1 text-lg font-black">Explore every role</h2>
          </div>
          <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-xs font-bold text-emerald-200">Read-only</span>
        </div>

        <div className="mt-4 grid gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.role}
              type="button"
              disabled={isLoading}
              onClick={() => handleDemoLogin(account.email)}
              className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-left transition hover:border-cyan-300/50 hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>
                <span className="block text-sm font-black text-white">{account.label}</span>
                <span className="mt-0.5 block text-xs text-slate-400 group-hover:text-slate-300">{account.description}</span>
              </span>
              <span aria-hidden="true" className="text-cyan-300">→</span>
            </button>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
        <span className="h-px flex-1 bg-white/10" />
        Or use credentials
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <form
        ref={formRef}
        method="post"
        onSubmit={handleSubmit}
        className="space-y-5"
        aria-busy={isLoading}
      >
      {error ? (
        <div
          id="login-error"
          role="alert"
          className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          {error}
        </div>
      ) : null}

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
          placeholder="you@example.com"
          className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
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
          className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Logging in..." : "Login"}
      </button>
      </form>
    </div>
  );
}
