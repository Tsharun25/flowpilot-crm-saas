import { CalendarDays, Mail, ShieldCheck, User, Users } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getCurrentUserWithWorkspace } from "@/lib/current-user";
import { updateProfile, updateWorkspace } from "./actions";

export default async function SettingsPage() {
  const { user, workspace, membership } = await getCurrentUserWithWorkspace();

  const [projectCount, taskCount, clientCount, memberCount] = await Promise.all([
    prisma.project.count({
      where: {
        workspaceId: workspace.id,
      },
    }),

    prisma.task.count({
      where: {
        project: {
          workspaceId: workspace.id,
        },
      },
    }),

    prisma.client.count({
      where: {
        workspaceId: workspace.id,
      },
    }),

    prisma.membership.count({
      where: {
        workspaceId: workspace.id,
      },
    }),
  ]);

  const accountStats = [
    {
      label: "Projects",
      value: projectCount,
      icon: CalendarDays,
    },
    {
      label: "Tasks",
      value: taskCount,
      icon: ShieldCheck,
    },
    {
      label: "Clients",
      value: clientCount,
      icon: Users,
    },
    {
      label: "Members",
      value: memberCount,
      icon: User,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-black uppercase tracking-wide text-cyan-600">
          Settings
        </p>
        <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
          Workspace Settings
        </h2>
        <p className="mt-3 max-w-2xl text-slate-500">
          Manage your profile, workspace identity, and account preferences.
        </p>
      </div>

      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {accountStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="grid size-12 place-items-center rounded-2xl bg-slate-950 text-white">
                <Icon size={20} />
              </div>

              <p className="mt-6 text-sm font-bold text-slate-500">
                {stat.label}
              </p>
              <p className="mt-2 text-3xl font-black text-slate-950">
                {stat.value}
              </p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <form
          action={updateProfile}
          className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-6">
            <h3 className="text-2xl font-black text-slate-950">
              Profile Details
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Update the name shown across your dashboard.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Full Name
              </label>
              <input
                name="name"
                required
                defaultValue={user.name || ""}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-cyan-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Email Address
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500">
                <Mail size={18} />
                <span className="font-medium">{user.email}</span>
              </div>
              <p className="mt-2 text-xs font-medium text-slate-400">
                Email change is disabled for this demo project.
              </p>
            </div>

            <button className="rounded-2xl bg-slate-950 px-6 py-3 font-black text-white transition hover:bg-slate-800">
              Save Profile
            </button>
          </div>
        </form>

        <form
          action={updateWorkspace}
          className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-6">
            <h3 className="text-2xl font-black text-slate-950">
              Workspace Identity
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Customize your workspace name and SaaS organization identity.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Workspace Name
              </label>
              <input
                name="name"
                required
                defaultValue={workspace.name}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-cyan-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Workspace Slug
              </label>
              <div className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 font-medium text-slate-500">
                {workspace.slug}
              </div>
              <p className="mt-2 text-xs font-medium text-slate-400">
                Slug is automatically generated from workspace name.
              </p>
            </div>

            <button className="rounded-2xl bg-cyan-400 px-6 py-3 font-black text-slate-950 transition hover:bg-cyan-300">
              Save Workspace
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-black text-slate-950">
            Account Access
          </h3>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm font-bold text-slate-500">Role</p>
              <p className="mt-2 text-xl font-black text-slate-950">
                {membership.role}
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm font-bold text-slate-500">Plan</p>
              <p className="mt-2 text-xl font-black text-slate-950">
                Free Demo
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 to-slate-800 p-6 text-white shadow-xl shadow-slate-300">
          <p className="text-sm font-black text-cyan-300">Portfolio Note</p>
          <h3 className="mt-3 text-2xl font-black">Almost production-ready</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Add team invites, billing, and audit logs later to make this feel
            like a complete B2B SaaS product.
          </p>
        </div>
      </section>
    </div>
  );
}