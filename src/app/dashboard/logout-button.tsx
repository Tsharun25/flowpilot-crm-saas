"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-full bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
    >
      Logout
    </button>
  );
}