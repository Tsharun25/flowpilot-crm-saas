import { prisma } from "@/lib/prisma";
import { getCurrentUserWithWorkspace } from "@/lib/current-user";
import { createClient, deleteClient, updateClientStatus } from "./actions";
import ClientStatusForm from "./status-form";

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

export default async function ClientsPage() {
  const { workspace } = await getCurrentUserWithWorkspace();

  const clients = await prisma.client.findMany({
    where: {
      workspaceId: workspace.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalPipelineValue = clients.reduce(
    (total, client) => total + client.value,
    0
  );

  const wonValue = clients
    .filter((client) => client.status === "WON")
    .reduce((total, client) => total + client.value, 0);

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-cyan-600">
            CRM
          </p>
          <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
            Client Pipeline
          </h2>
          <p className="mt-2 max-w-2xl text-slate-500">
            Track leads, prospects, won deals, and lost opportunities.
          </p>
        </div>
      </div>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Total Clients</p>
          <p className="mt-3 text-3xl font-black text-slate-950">
            {clients.length}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Pipeline Value</p>
          <p className="mt-3 text-3xl font-black text-slate-950">
            ${totalPipelineValue.toLocaleString()}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Won Revenue</p>
          <p className="mt-3 text-3xl font-black text-slate-950">
            ${wonValue.toLocaleString()}
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form
          action={createClient}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="text-xl font-black text-slate-950">
            Add New Client
          </h3>

          <div className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Client Name
              </label>
              <input
                name="name"
                required
                placeholder="John Smith"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-cyan-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Company
              </label>
              <input
                name="company"
                placeholder="Acme Inc."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-cyan-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="client@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-cyan-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Deal Value
              </label>
              <input
                name="value"
                type="number"
                min="0"
                defaultValue="0"
                placeholder="5000"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-cyan-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Status
              </label>
              <select
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

            <button className="w-full rounded-2xl bg-cyan-400 px-5 py-3 font-black text-slate-950 transition hover:bg-cyan-300">
              Add Client
            </button>
          </div>
        </form>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-950">
              Pipeline Board
            </h3>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
              {clients.length} clients
            </span>
          </div>

          {clients.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <p className="text-lg font-black text-slate-950">
                No clients yet
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Add your first client from the form on the left.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-4">
              {columns.map((column) => {
                const columnClients = clients.filter(
                  (client) => client.status === column.value
                );

                const columnValue = columnClients.reduce(
                  (total, client) => total + client.value,
                  0
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
                          ${columnValue.toLocaleString()}
                        </p>
                      </div>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600">
                        {columnClients.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {columnClients.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-center text-sm font-medium text-slate-400">
                          Empty
                        </div>
                      ) : (
                        columnClients.map((client) => {
                          const deleteClientWithId = deleteClient.bind(
                            null,
                            client.id
                          );

                          return (
                            <div
                              key={client.id}
                              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-black text-slate-950">
                                    {client.name}
                                  </p>

                                  {client.company ? (
                                    <p className="mt-1 text-xs font-bold text-slate-500">
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
                                <p className="mt-3 break-all text-sm text-slate-500">
                                  {client.email}
                                </p>
                              ) : null}

                              <p className="mt-3 text-lg font-black text-slate-950">
                                ${client.value.toLocaleString()}
                              </p>

                              <ClientStatusForm
                                clientId={client.id}
                                currentStatus={client.status}
                              />

                              <form action={deleteClientWithId}>
                                <button className="mt-3 w-full rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100">
                                  Delete Client
                                </button>
                              </form>
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