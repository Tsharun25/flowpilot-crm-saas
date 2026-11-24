import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import FlowPilotBrand from "@/components/flowpilot-brand";
import { authOptions } from "@/lib/auth";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your FlowPilot CRM workspace.",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/dashboard");

  return (
    <main className="flow-login">
      <section className="flow-login-preview" aria-labelledby="login-preview-title">
        <FlowPilotBrand />
        <div>
          <h2 id="login-preview-title">A workspace for the whole client journey.</h2>
          <p>Follow a deal from first conversation through project delivery.</p>
          <Image src="/product/workspace-overview-round4.png" alt="FlowPilot dashboard with sample data" width={1920} height={1080} sizes="55vw" />
        </div>
      </section>
      <section className="flow-login-form" aria-labelledby="login-title">
        <div className="flow-login-mobile-brand"><FlowPilotBrand /></div>
        <h1 id="login-title">Sign in to FlowPilot</h1>
        <p>Use your account or choose a demo role below.</p>
        <LoginForm />
        <div className="flow-login-links">
          <Link href="/forgot-password">Forgot password?</Link>
          <Link href="/register">Create an account</Link>
        </div>
      </section>
    </main>
  );
}
