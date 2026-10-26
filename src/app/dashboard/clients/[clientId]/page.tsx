import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import SubmitButton from "@/components/submit-button";
import { formatMoney } from "@/lib/analytics";
import { getCurrentUserWithWorkspace } from "@/lib/current-user";
import { centsToDollars, getDealValueCents } from "@/lib/crm-metrics";
import { prisma } from "@/lib/prisma";
import { clientIdSchema } from "@/lib/validators/workspace";
import { addClientNote, convertWonClientToProject } from "../actions";

export const metadata: Metadata = { title: "Client details", description: "Review client follow-ups, projects, notes, and activity." };

function dateLabel(date: Date) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(date) + " UTC";
}

export default async function ClientDetailsPage({ params }: { params: Promise<{ clientId: string }> }) {
  const parsed = clientIdSchema.safeParse((await params).clientId);
  if (!parsed.success) notFound();
  const { workspace } = await getCurrentUserWithWorkspace();
  const client = await prisma.client.findFirst({
    where: { id: parsed.data, workspaceId: workspace.id },
    include: {
      projects: { orderBy: { createdAt: "desc" }, select: { id: true, name: true, status: true } },
      conversion: { select: { projectId: true } },
      notes: { orderBy: [{ createdAt: "desc" }, { id: "desc" }], include: { author: { select: { name: true } } } },
      activities: { orderBy: [{ createdAt: "desc" }, { id: "desc" }], include: { actor: { select: { name: true } } } },
    },
  });
  if (!client) notFound();
  const addNote = addClientNote.bind(null, client.id);
  const timeline = [
    ...client.notes.map((note) => ({ id: note.id, at: note.createdAt, title: "Note", body: note.body, author: note.author.name })),
    ...client.activities.map((activity) => ({ id: activity.id, at: activity.createdAt, title: activity.kind === "CONVERSION" ? "Conversion" : "Status change", body: activity.summary, author: activity.actor.name })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime() || b.id.localeCompare(a.id));

  return (
    <div className="space-y-6">
      <Link href="/dashboard/clients" className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold">← Back to Clients</Link>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div><p className="text-sm font-black uppercase text-cyan-700">{client.status}</p><h2 className="mt-2 text-3xl font-black">{client.name}</h2><p className="mt-2 text-slate-600">{client.company || "No company"} · {client.email || "No email"}</p></div>
          <p className="text-2xl font-black">{formatMoney(centsToDollars(getDealValueCents(client)))}</p>
        </div>
        <p className="mt-4 text-sm font-bold text-slate-600">Next follow-up: {client.nextFollowUp ? client.nextFollowUp.toISOString().slice(0, 10) + " (UTC date)" : "Not scheduled"}</p>
        {client.status === "WON" ? client.conversion ? <Link href={`/dashboard/projects/${client.conversion.projectId}`} className="mt-4 inline-flex rounded-xl bg-emerald-50 px-4 py-3 font-black text-emerald-800">Open converted project</Link> : <form action={convertWonClientToProject.bind(null, client.id)}><SubmitButton pendingText="Converting..." className="mt-4 rounded-xl bg-emerald-600 px-4 py-3 font-black text-white">Convert Won Deal to Project</SubmitButton></form> : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-black">Linked Projects</h3>
          <div className="mt-4 space-y-3">{client.projects.length ? client.projects.map((project) => <Link key={project.id} href={`/dashboard/projects/${project.id}`} className="flex justify-between rounded-2xl bg-slate-50 p-4 font-bold"><span>{project.name}</span><span className="text-xs">{project.status}</span></Link>) : <p className="rounded-2xl border border-dashed p-5 text-sm text-slate-600">No projects linked to this client.</p>}</div>
        </div>
        <form action={addNote} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-black">Add Note</h3>
          <input type="hidden" name="requestId" value={randomUUID()} />
          <label htmlFor="client-note" className="mt-4 block text-sm font-bold">Plain-text note</label>
          <textarea id="client-note" name="body" required maxLength={2000} rows={6} className="mt-2 w-full rounded-2xl border border-slate-200 p-4" />
          <SubmitButton pendingText="Adding..." className="mt-3 rounded-xl bg-slate-950 px-5 py-3 font-black text-white">Add Note</SubmitButton>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-black">Notes & Activity</h3>
        <div className="mt-4 space-y-3">{timeline.length ? timeline.map((item) => <article key={item.id} className="rounded-2xl bg-slate-50 p-4"><div className="flex flex-wrap justify-between gap-2"><p className="font-black">{item.title}</p><time className="text-xs font-bold text-slate-500">{dateLabel(item.at)}</time></div><p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700">{item.body}</p><p className="mt-2 text-xs font-bold text-slate-500">By {item.author}</p></article>) : <p className="rounded-2xl border border-dashed p-5 text-sm text-slate-600">No notes or activity yet.</p>}</div>
      </section>
    </div>
  );
}
