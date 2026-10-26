import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import RegisterForm from "./register-form";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a FlowPilot CRM account and workspace.",
};

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
              Create an editable CRM and project workspace.
            </p>
          </div>

          <RegisterForm />

          <p className="mt-4 text-center text-xs leading-5 text-slate-400">
            By creating an account, you acknowledge the deployment owner&apos;s <Link href="/terms" className="text-cyan-300">terms</Link> and <Link href="/privacy" className="text-cyan-300">privacy notice</Link>.
          </p>

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
