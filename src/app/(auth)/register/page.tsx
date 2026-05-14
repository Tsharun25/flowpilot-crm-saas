import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import RegisterForm from "./register-form";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-white">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-center text-3xl font-black">
          FlowPilot
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black">Create your account</h1>
            <p className="mt-2 text-sm text-slate-400">
              Start your SaaS workspace in seconds.
            </p>
          </div>

          <RegisterForm />

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-cyan-300">
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}