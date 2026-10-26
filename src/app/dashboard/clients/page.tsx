import { randomUUID } from "node:crypto";
import Link from "next/link";
import type { ClientStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUserWithWorkspace } from "@/lib/current-user";
import { convertWonClientToProject, createClient, deleteClient, updateClient } from "./actions";
import ClientStatusForm from "./status-form";
import { formatMoney } from "@/lib/analytics";
import {
  calculateCrmMetrics,
  centsToDollars,
  getDealValueCents,
  getDealValueInput,
} from "@/lib/crm-metrics";
import ConfirmSubmitButton from "@/components/confirm-submit-button";
import SubmitButton from "@/components/submit-button";
import { isDemoWorkspace } from "@/lib/demo-workspace";

const columns = [
  { label: "Lead", value: "LEAD" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Won", value: "WON" },
  { label: "Lost", value: "LOST" },
] as const;

function getStatusStyle(status: string) {
  if (status === "WON") return "bg-emerald-100 text-emerald-700";
  if (status === "LOST") return "bg-red-100 text-red-700";
  if (status === "CONTACTED") return "bg-blue-100 text-blue-700";
  return "bg-cyan-100 text-cyan-700";
}

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { user, workspace, membership } = await getCurrentUserWithWorkspace();
  const demoReadOnly = isDemoWorkspace(workspace, user.email);
  const canDelete = membership.role === "OWNER" || membership.role === "ADMIN";
  const params = await searchParams;
  const q = (params.q ?? "").trim().slice(0, 100);
  const allowedStatuses = new Set(["LEAD", "CONTACTED", "WON", "LOST"]);
  const status = allowedStatuses.has(params.status ?? "") ? params.status as ClientStatus : undefined;
  const where: Prisma.ClientWhereInput = {
    workspaceId: workspace.id,
    ...(status ? { status } : {}),
    ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { company: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {}),
  };

  const clients = await prisma.client.findMany({
    where,
    include: { conversion: { select: { projectId: true } } },
    orderBy: {
      createdAt: "desc",
    },
  });
  const metrics = calculateCrmMetrics(clients);

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-cyan-700">
            CRM
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Client Pipeline
          </h2>
          <p className="mt-2 max-w-2xl text-slate-500">
            Track leads, prospects, won deals, and lost opportunities.
          </p>
        </div>
      </div>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Filtered Clients</p>
          <p className="mt-3 break-words text-2xl font-black text-slate-950 xl:text-3xl">
            {clients.length}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Filtered Open Pipeline</p>
          <p className="mt-3 break-words text-2xl font-black text-slate-950 xl:text-3xl">
            {formatMoney(metrics.openPipeline)}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Filtered Won Deal Value</p>
          <p className="mt-3 break-words text-2xl font-black text-slate-950 xl:text-3xl">
            {formatMoney(metrics.wonDealValue)}
          </p>
        </div>
      </section>

      <form className="mb-6 grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_220px_auto_auto]" method="get">
        <label className="sr-only" htmlFor="client-search">Search clients</label>
        <input id="client-search" name="q" defaultValue={q} placeholder="Search name, company, or email" className="rounded-xl border border-slate-200 px-4 py-3" />
        <label className="sr-only" htmlFor="client-filter-status">Filter status</label>
        <select id="client-filter-status" name="status" defaultValue={status ?? ""} className="rounded-xl border border-slate-200 px-4 py-3">
          <option value="">All statuses</option><option value="LEAD">Lead</option><option value="CONTACTED">Contacted</option><option value="WON">Won</option><option value="LOST">Lost</option>
        </select>
        <button className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white">Apply</button>
        <Link href="/dashboard/clients" className="rounded-xl border border-slate-200 px-5 py-3 text-center font-bold">Reset</Link>
      </form>
      <div className="mb-6 flex justify-end">
        <a href={`/api/export/clients?${new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}) })}`} className="rounded-xl border border-cyan-300 bg-cyan-50 px-4 py-2 text-sm font-black text-cyan-900">Export filtered CSV</a>
      </div>

      <section className="space-y-6">
        <form
          action={createClient}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="text-xl font-black text-slate-950">
            Add New Client
          </h3>

          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="client-name" className="mb-2 block text-sm font-bold text-slate-700">
                Client Name
              </label>
              <input
                id="client-name"
                name="name"
                required
                placeholder="John Smith"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-cyan-400 focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="client-company" className="mb-2 block text-sm font-bold text-slate-700">
                Company
              </label>
              <input
                id="client-company"
                name="company"
                placeholder="Acme Inc."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-cyan-400 focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="client-email" className="mb-2 block text-sm font-bold text-slate-700">
                Email
              </label>
              <input
                id="client-email"
                name="email"
                type="email"
                placeholder="client@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-cyan-400 focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="client-value" className="mb-2 block text-sm font-bold text-slate-700">
                Deal Value (USD)
              </label>
              <input
                id="client-value"
                name="value"
                type="number"
                min="0"
                max="1000000000.00"
                step="0.01"
                inputMode="decimal"
                required
                defaultValue="0.00"
                placeholder="5000.00"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-cyan-400 focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="client-status" className="mb-2 block text-sm font-bold text-slate-700">
                Status
              </label>
              <select
                id="client-status"
                name="status"
                defaultValue="LEAD"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-cyan-400 focus:bg-white"
              >
                <option value="LEAD">Lead</option>
                <option value="CONTACTED">Contacted</option>
                <option value="WON">Won</option>
                <option value="LOST">Lost</option>
              </select>
            </div>

            <div>
              <label htmlFor="client-follow-up" className="mb-2 block text-sm font-bold text-slate-700">Next Follow-up (UTC date)</label>
              <input id="client-follow-up" name="nextFollowUp" type="date" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>

            <SubmitButton
              disabled={demoReadOnly}
              pendingText="Adding Client..."
              className="w-full rounded-2xl bg-cyan-400 px-5 py-3 font-black text-slate-950 transition hover:bg-cyan-300"
            >
              Add Client
            </SubmitButton>
          </div>
        </form>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-950">
              Pipeline Board
            </h3>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
              {clients.length} {clients.length === 1 ? "client" : "clients"}
            </span>
          </div>

          {clients.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <p className="text-lg font-black text-slate-950">
                {q || status ? "No clients match these filters" : "No clients yet"}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {q || status ? "Reset the filters or try a different search." : "Create your first client with the form above."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
              {columns.map((column) => {
                const columnClients = clients.filter(
                  (client) => client.status === column.value
                );

                const columnValue = columnClients.reduce(
                  (total, client) => total + getDealValueCents(client),
                  BigInt(0)
                );

                return (
                  <div
                    key={column.value}
                    className="rounded-3xl bg-slate-50 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-black text-slate-950">
                          {column.label}
                        </h4>
                        <p className="text-xs font-bold text-slate-500">
                          {formatMoney(centsToDollars(columnValue))}
                        </p>
                      </div>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600">
                        {columnClients.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {columnClients.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-center text-sm font-medium text-slate-600">
                          Empty
                        </div>
                      ) : (
                        columnClients.map((client) => {
                          const deleteClientWithId = deleteClient.bind(
                            null,
                            client.id
                          );
                          const updateClientWithId = updateClient.bind(null, client.id);

                          return (
                            <div
                              key={client.id}
                              data-testid="client-card"
                              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="break-words font-black text-slate-950">
                                    {client.name}
                                  </p>

                                  {client.company ? (
                                    <p className="mt-1 break-words text-xs font-bold text-slate-500">
                                      {client.company}
                                    </p>
                                  ) : null}
                                </div>

                                <span
                                  className={`rounded-full px-2.5 py-1 text-[10px] font-black ${getStatusStyle(
                                    client.status
                                  )}`}
                                >
                                  {client.status}
                                </span>
                              </div>

                              {client.email ? (
                                <p className="mt-3 truncate text-sm text-slate-500" title={client.email}>
                                  {client.email}
                                </p>
                              ) : null}

                              <p className="mt-3 break-words text-lg font-black text-slate-950">
                                {formatMoney(centsToDollars(getDealValueCents(client)))}
                              </p>

                              {client.nextFollowUp ? <p className="mt-2 text-xs font-bold text-slate-600">Follow-up: {client.nextFollowUp.toISOString().slice(0, 10)}</p> : null}

                              <Link href={`/dashboard/clients/${client.id}`} className="mt-3 block rounded-xl border border-slate-200 px-3 py-2 text-center text-xs font-black text-slate-700">View details & activity</Link>

                              <ClientStatusForm
                                clientId={client.id}
                                currentStatus={client.status}
                                disabled={demoReadOnly}
                              />

                              <details className="mt-3 rounded-xl border border-slate-200 p-3">
                                <summary className="cursor-pointer text-center text-xs font-black text-slate-700">Edit Client</summary>
                                <form
                                  key={client.updatedAt.toISOString()}
                                  action={updateClientWithId}
                                  className="mt-3 space-y-3"
                                >
                                  <input aria-label="Client name" name="name" required defaultValue={client.name} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                                  <input aria-label="Company" name="company" defaultValue={client.company ?? ""} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                                  <input aria-label="Email" name="email" type="email" defaultValue={client.email ?? ""} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                                  <input aria-label="Deal value in USD" name="value" type="number" min="0" max="1000000000.00" step="0.01" inputMode="decimal" required defaultValue={getDealValueInput(client)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                                  <input aria-label="Next follow-up" name="nextFollowUp" type="date" defaultValue={client.nextFollowUp?.toISOString().slice(0, 10) ?? ""} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                                  <input type="hidden" name="status" value={client.status} />
                                  <input type="hidden" name="eventKey" value={randomUUID()} />
                                  <SubmitButton
                                    disabled={demoReadOnly}
                                    pendingText="Saving..."
                                    className="w-full rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white"
                                  >
                                    Save Changes
                                  </SubmitButton>
                                </form>
                              </details>

                              {client.status === "WON" ? client.conversion ? (
                                <Link href={`/dashboard/projects/${client.conversion.projectId}`} className="mt-3 block rounded-xl bg-emerald-50 px-3 py-2 text-center text-xs font-black text-emerald-800">Open converted project</Link>
                              ) : (
                                <form action={convertWonClientToProject.bind(null, client.id)}>
                                  <SubmitButton disabled={demoReadOnly} pendingText="Converting..." className="mt-3 w-full rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white">Convert Won Deal to Project</SubmitButton>
                                </form>
                              ) : null}

                              {canDelete ? (
                                <form action={deleteClientWithId}>
                                  <ConfirmSubmitButton disabled={demoReadOnly} message={`Delete ${client.name}? This cannot be undone.`} className="mt-3 w-full rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100">
                                    Delete Client
                                  </ConfirmSubmitButton>
                                </form>
                              ) : null}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
