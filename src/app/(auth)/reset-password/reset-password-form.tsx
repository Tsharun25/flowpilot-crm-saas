"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [message, setMessage] = useState(token ? "" : "This reset link is missing or invalid.");
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.get("password"), confirmPassword: data.get("confirmPassword") }),
      });
      const result = await response.json() as { message?: string };
      setSuccess(response.ok);
      setMessage(result.message ?? "Unable to reset the password.");
    } catch {
      setMessage("Unable to reset the password. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return <div className="mt-6"><div role="status" className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">{message}</div><Link href="/login" className="mt-5 block w-full rounded-2xl bg-cyan-400 px-5 py-3 text-center font-bold text-slate-950">Continue to login</Link></div>;
  }

  return <form method="post" onSubmit={submit} className="mt-6 space-y-5" aria-busy={pending}>
    {message ? <div role="alert" className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{message}</div> : null}
    <div><label htmlFor="password" className="mb-2 block text-sm font-medium">New password</label><input id="password" name="password" type="password" required minLength={8} maxLength={72} autoComplete="new-password" className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-cyan-300" /></div>
    <div><label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium">Confirm new password</label><input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} maxLength={72} autoComplete="new-password" className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-cyan-300" /></div>
    <button type="submit" disabled={pending || !token} className="w-full rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 disabled:opacity-60">{pending ? "Changing…" : "Change password"}</button>
  </form>;
}
