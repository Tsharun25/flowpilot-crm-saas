"use client";
import { useState, type FormEvent } from "react";

export default function ForgotPasswordForm() {
  const [message, setMessage] = useState(""); const [error, setError] = useState(false); const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setMessage(""); setError(false);
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email") }) });
      const result = await response.json() as { message?: string };
      setError(!response.ok); setMessage(result.message ?? "Unable to submit the request.");
    } catch { setError(true); setMessage("Unable to submit the request. Please try again."); } finally { setPending(false); }
  }
  return <form onSubmit={submit} className="mt-6 space-y-5" aria-busy={pending}><div aria-live="polite">{message ? <div role={error ? "alert" : "status"} className={`rounded-2xl border px-4 py-3 text-sm ${error ? "border-red-500/20 bg-red-500/10 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}>{message}</div> : null}</div><div><label htmlFor="email" className="mb-2 block text-sm font-medium">Email</label><input id="email" name="email" type="email" required autoComplete="email" className="w-full rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-slate-950 outline-none focus:border-violet-600" /></div><button type="submit" disabled={pending} className="w-full rounded-2xl bg-violet-700 px-5 py-3 font-bold text-white hover:bg-violet-800 disabled:opacity-60">{pending ? "Sending…" : "Send reset instructions"}</button></form>;
}
