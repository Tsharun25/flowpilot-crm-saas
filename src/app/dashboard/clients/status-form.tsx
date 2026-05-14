"use client";

import { useTransition } from "react";
import { updateClientStatus } from "./actions";

type ClientStatus = "LEAD" | "CONTACTED" | "WON" | "LOST";

export default function ClientStatusForm({
  clientId,
  currentStatus,
}: {
  clientId: string;
  currentStatus: ClientStatus;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(status: ClientStatus) {
    startTransition(async () => {
      await updateClientStatus(clientId, status);
    });
  }

  return (
    <select
      value={currentStatus}
      disabled={isPending}
      onChange={(event) => handleChange(event.target.value as ClientStatus)}
      className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-cyan-400 disabled:opacity-60"
    >
      <option value="LEAD">Lead</option>
      <option value="CONTACTED">Contacted</option>
      <option value="WON">Won</option>
      <option value="LOST">Lost</option>
    </select>
  );
}