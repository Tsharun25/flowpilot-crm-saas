import type { Metadata } from "next";
import { CalendarDays, Mail, ShieldCheck, User, Users } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { isDemoWorkspace } from "@/lib/demo-workspace";
import { getCurrentUserWithWorkspace } from "@/lib/current-user";
import SubmitButton from "@/components/submit-button";
import { updateProfile, updateWorkspace } from "./actions";
import { APP_VERSION } from "@/lib/version";

export const metadata: Metadata = {
  title: "Workspace settings",
  description: "Manage your FlowPilot profile and workspace identity.",
};

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

  const canManageWorkspace =
    membership.role === "OWNER" || membership.role === "ADMIN";
  const canEditWorkspace =
    canManageWorkspace && !isDemoWorkspace(workspace, user.email);
  const demoReadOnly = isDemoWorkspace(workspace, user.email);
  const workspaceReadOnlyReason = canManageWorkspace
    ? "The public demo workspace is read-only. Use a non-demo workspace to change its identity."
    : "Only workspace owners and administrators can change workspace identity.";

  const workspaceIdentityContent = (
    <>
      <div className="mb-6">
        <h3
          id="workspace-identity-title"
          className="text-2xl font-black text-slate-950"
        >
          Workspace Identity
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {canEditWorkspace
            ? "Customize your workspace name and organization identity."
            : "View the identity assigned to your current workspace."}
        </p>
      </div>

      <div className="space-y-5">
        <div>
          {canEditWorkspace ? (
            <label
              htmlFor="workspace-name"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Workspace Name
            </label>
          ) : (
            <p className="mb-2 block text-sm font-bold text-slate-700">
              Workspace Name
            </p>
          )}

          {canEditWorkspace ? (
            <input
              id="workspace-name"
              name="name"
              required
              defaultValue={workspace.name}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-cyan-400 focus:bg-white"
            />
          ) : (
            <div className="break-all rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 font-medium text-slate-600">
              {workspace.name}
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 block text-sm font-bold text-slate-700">
            Workspace Slug
          </p>
          <div className="break-all rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 font-medium text-slate-500">
            {workspace.slug}
          </div>
          <p className="mt-2 text-xs font-medium text-slate-600">
            Slug is automatically generated from workspace name.
          </p>
        </div>

        {canEditWorkspace ? (
          <SubmitButton
            pendingText="Saving Workspace..."
            className="rounded-2xl bg-cyan-400 px-6 py-3 font-black text-slate-950 transition hover:bg-cyan-300"
          >
            Save Workspace
          </SubmitButton>
        ) : (
          <p
            role="note"
            className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium leading-6 text-amber-900"
          >
            {workspaceReadOnlyReason}
          </p>
        )}
      </div>
    </>
  );

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-black uppercase tracking-wide text-cyan-700">
          Settings
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
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
          key={user.name}
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
              <label
                htmlFor="profile-full-name"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Full Name
              </label>
              <input
                id="profile-full-name"
                name="name"
                required
                defaultValue={user.name || ""}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-cyan-400 focus:bg-white"
              />
            </div>

            <div>
              <p className="mb-2 block text-sm font-bold text-slate-700">
                Email Address
              </p>
              <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500">
                <Mail size={18} className="shrink-0" />
                <span className="min-w-0 break-all font-medium">
                  {user.email}
                </span>
              </div>
              <p className="mt-2 text-xs font-medium text-slate-600">
                Contact an administrator to change the account email.
              </p>
            </div>

            <SubmitButton
              disabled={demoReadOnly}
              pendingText="Saving Profile..."
              className="rounded-2xl bg-slate-950 px-6 py-3 font-black text-white transition hover:bg-slate-800"
            >
              Save Profile
            </SubmitButton>
          </div>
        </form>

        {canEditWorkspace ? (
          <form
            key={`${workspace.name}:${workspace.slug}`}
            action={updateWorkspace}
            aria-labelledby="workspace-identity-title"
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
          >
            {workspaceIdentityContent}
          </form>
        ) : (
          <section
            aria-labelledby="workspace-identity-title"
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
          >
            {workspaceIdentityContent}
          </section>
        )}
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
                Self-hosted
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 to-slate-800 p-6 text-white shadow-xl shadow-slate-300">
          <p className="text-sm font-black text-cyan-300">FlowPilot CRM v{APP_VERSION}</p>
          <h3 className="mt-3 text-2xl font-black">Ready for your workflow</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Customize the brand, seed your workspace, and deploy with the
            included guides.
          </p>
        </div>
      </section>
    </div>
  );
}
