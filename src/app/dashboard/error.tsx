"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error("DASHBOARD_ERROR", error);
  }, [error]);

  return (
    <section className="mx-auto max-w-xl rounded-[2rem] border border-red-200 bg-white p-6 text-center shadow-sm sm:p-10">
      <p className="text-sm font-black uppercase tracking-wide text-red-600">
        Request not completed
      </p>
      <h2 className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">
        Something went wrong
      </h2>
      <p className="mt-3 leading-7 text-slate-600">
        Your change may not have been saved. Check the current page before
        trying again.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-full bg-slate-950 px-6 py-3 font-black text-white transition hover:bg-slate-800"
        >
          Try Again
        </button>
        <a
          href="/dashboard"
          className="rounded-full border border-slate-300 px-6 py-3 font-black text-slate-700 transition hover:bg-slate-50"
        >
          Dashboard Home
        </a>
      </div>
    </section>
  );
}
