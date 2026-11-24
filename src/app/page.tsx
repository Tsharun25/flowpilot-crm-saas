import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BarChart3, BriefcaseBusiness, CheckSquare2, Database, ShieldCheck, UsersRound } from "lucide-react";
import FlowPilotBrand from "@/components/flowpilot-brand";
import PublicFooter from "@/components/public-footer";

export const metadata: Metadata = {
  title: "FlowPilot CRM — From signed deal to delivered work",
  description: "A self-hosted CRM and project workspace for small agencies and independent teams.",
  alternates: { canonical: "/" },
};

const features = [
  { title: "Keep your pipeline in view", text: "Track deal values, client notes and the next follow-up in one place.", icon: UsersRound },
  { title: "Hand off a won deal", text: "Turn a won opportunity into a linked project with its client context intact.", icon: BriefcaseBusiness },
  { title: "Make the next task clear", text: "Organize work in Kanban, prioritize tasks and filter by project, priority or overdue status.", icon: CheckSquare2 },
  { title: "See what the team delivered", text: "Review won deal value, open opportunities and project progress from workspace data.", icon: BarChart3 },
];

export default function HomePage() {
  return (
    <div className="flow-landing">
      <header className="flow-public-nav flow-wrap">
        <FlowPilotBrand />
        <nav aria-label="Main navigation">
          <a href="#features">Features</a>
          <a href="#product">Product tour</a>
          <a href="#benefits">Benefits</a>
        </nav>
        <Link className="flow-button flow-button-outline" href="/login">Live Demo</Link>
      </header>
      <main>
        <section className="flow-hero flow-wrap">
          <div className="flow-hero-copy">
            <p className="flow-kicker">Client operations for small teams</p>
            <h1>From signed deal to <em>delivered work.</em></h1>
            <p>Manage your pipeline, projects and daily tasks in one self-hosted workspace built for agencies and independent teams.</p>
            <div className="flow-actions">
              <Link className="flow-button" href="/login">Live Demo</Link>
              <a className="flow-button flow-button-outline" href="#product">See the product</a>
            </div>
            <p className="flow-hero-note">Explore a read-only workspace with sample data.</p>
          </div>
          <figure className="flow-hero-preview">
            <figcaption><span>FlowPilot workspace</span><span>Sample data</span></figcaption>
            <Image src="/product/workspace-overview-round4.png" width={1920} height={1080} sizes="(min-width: 1000px) 58vw, 100vw" alt="Workspace overview with project and task counts, open pipeline and a won deal chart" priority />
          </figure>
        </section>
        <section className="flow-features" id="features">
          <div className="flow-wrap">
            <p className="flow-kicker">Features</p>
            <h2>Every step of client work,<br className="hidden sm:block" /> connected.</h2>
            <div className="flow-feature-grid">
              {features.map(({ title, text, icon: Icon }) => (
                <article key={title}>
                  <span className="flow-feature-icon"><Icon size={23} aria-hidden="true" /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="flow-wrap flow-tour" id="product">
          <p className="flow-kicker">Product tour</p>
          <h2>Follow the work as it moves.</h2>
          <div className="flow-tour-grid">
            {[
              { file: "client-pipeline", title: "Track an opportunity", text: "Check deal stage, value and the next client follow-up." },
              { file: "project-delivery", title: "Plan delivery", text: "Open the project linked to a won deal and track completion." },
              { file: "task-board", title: "See what’s due", text: "Scan tasks by stage, priority and due date across projects." },
              { file: "analytics", title: "Review deal value", text: "Compare open pipeline with deals marked Won." },
            ].map(({ file, title, text }) => (
              <figure key={file}>
                <Image src={`/product/${file}-round4.png`} width={1920} height={1080} sizes="(min-width: 720px) 48vw, 100vw" alt={title + " in a FlowPilot demo workspace"} />
                <figcaption><strong>{title}</strong>{text}</figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-600">Screens show sample workspace data.</p>
          <Link href="/login" className="flow-button">Try the workspace</Link>
        </section>
        <section className="flow-wrap flow-benefits" id="benefits">
          <div>
            <p className="flow-kicker">Built to self-host</p>
            <h2>Run it on your terms.</h2>
          </div>
          <ul>
            <li><Database aria-hidden="true" /><div><strong>Own your data</strong><p>Connect your own MongoDB database and export workspace records as CSV.</p></div></li>
            <li><ShieldCheck aria-hidden="true" /><div><strong>Give each role the right access</strong><p>Owners, admins and members can work in the same workspace with role-based permissions.</p></div></li>
          </ul>
        </section>
        <section className="flow-wrap flow-final">
          <h2>Get to know FlowPilot.</h2>
          <p>Pick a demo role and open a workspace already filled with sample projects and client records.</p>
          <Link href="/login" className="flow-button">Live Demo</Link>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
