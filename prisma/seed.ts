import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  DEMO_ACCOUNT_EMAIL,
  isDemoWorkspace,
} from "../src/lib/demo-workspace";

const prisma = new PrismaClient();

async function main() {
  if (!process.argv.includes("--confirm-demo-reset")) {
    throw new Error(
      "Demo seeding deletes and recreates data. Run `npm run seed:demo` only against a dedicated demo database.",
    );
  }

  const demoEmail = DEMO_ACCOUNT_EMAIL;
  const demoPassword = await bcrypt.hash("DemoFlow2026!", 12);

  let user = await prisma.user.findUnique({
    where: {
      email: demoEmail,
    },
    include: {
      memberships: {
        include: {
          workspace: true,
        },
      },
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Demo User",
        email: demoEmail,
        password: demoPassword,
        memberships: {
          create: {
            role: "OWNER",
            workspace: {
              create: {
                name: "FlowPilot Demo",
                slug: `flowpilot-demo-${Date.now()}`,
                isDemo: true,
              },
            },
          },
        },
      },
      include: {
        memberships: {
          include: {
            workspace: true,
          },
        },
      },
    });
  } else {
    const dedicatedDemoWorkspace = user.memberships.find(({ workspace }) =>
      isDemoWorkspace(workspace, demoEmail),
    )?.workspace;

    if (!dedicatedDemoWorkspace) {
      throw new Error(
        "Refusing to reset data: demo@flowpilot.com is not attached to a dedicated FlowPilot demo workspace.",
      );
    }

    if (!dedicatedDemoWorkspace.isDemo) {
      await prisma.workspace.update({
        where: { id: dedicatedDemoWorkspace.id },
        data: { isDemo: true },
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: demoPassword },
    });
  }

  const workspace = user.memberships.find(({ workspace }) =>
    isDemoWorkspace(workspace, demoEmail),
  )?.workspace;

  if (!workspace) {
    throw new Error("Dedicated demo workspace not found.");
  }

  await prisma.clientNote.deleteMany({ where: { client: { workspaceId: workspace.id } } });
  await prisma.clientActivity.deleteMany({ where: { client: { workspaceId: workspace.id } } });
  await prisma.dealConversion.deleteMany({ where: { client: { workspaceId: workspace.id } } });

  await prisma.task.deleteMany({
    where: {
      project: {
        workspaceId: workspace.id,
      },
    },
  });

  await prisma.project.deleteMany({
    where: {
      workspaceId: workspace.id,
    },
  });

  await prisma.client.deleteMany({
    where: {
      workspaceId: workspace.id,
    },
  });

  const futureDate = new Date();
  futureDate.setUTCHours(0, 0, 0, 0);
  futureDate.setUTCDate(futureDate.getUTCDate() + 7);
  const dueSoon = new Date();
  dueSoon.setUTCHours(0, 0, 0, 0);
  dueSoon.setUTCDate(dueSoon.getUTCDate() + 3);

  await prisma.client.createMany({
    data: [
      { name: "Mario Rossi", company: "Rossi Digital", email: "mario@example.com", value: 500000, valueCents: BigInt(50_000_000), status: "WON", wonAt: new Date(), workspaceId: workspace.id },
      { name: "Sarah Khan", company: "LaunchLab", email: "sarah@example.com", value: 120000, valueCents: BigInt(12_000_000), status: "CONTACTED", nextFollowUp: futureDate, workspaceId: workspace.id },
      { name: "Daniel Lee", company: "Northstar Apps", email: "daniel@example.com", value: 85000, valueCents: BigInt(8_500_000), status: "LEAD", workspaceId: workspace.id },
      { name: "Ayesha Rahman", company: "BrightWorks", email: "ayesha@example.com", value: 45000, valueCents: BigInt(4_500_000), status: "LOST", workspaceId: workspace.id },
    ],
  });
  const [mario, sarah] = await Promise.all([
    prisma.client.findFirstOrThrow({ where: { workspaceId: workspace.id, email: "mario@example.com" } }),
    prisma.client.findFirstOrThrow({ where: { workspaceId: workspace.id, email: "sarah@example.com" } }),
  ]);

  const websiteProject = await prisma.project.create({
    data: {
      name: "Website Redesign",
      description:
        "Modern marketing website redesign for a growing SaaS brand.",
      status: "ACTIVE",
      workspaceId: workspace.id,
      clientId: mario.id,
      tasks: {
        create: [
          {
            title: "Create landing page wireframe",
            description: "Design hero, features, pricing, and CTA sections.",
            status: "DONE",
            priority: "HIGH",
          },
          {
            title: "Build responsive homepage",
            description: "Implement responsive layout with Tailwind CSS.",
            status: "IN_PROGRESS",
            priority: "URGENT",
            dueDate: dueSoon,
          },
          {
            title: "Write homepage copy",
            description: "Prepare polished SaaS marketing copy.",
            status: "REVIEW",
            priority: "MEDIUM",
          },
        ],
      },
    },
  });

  await prisma.project.create({
    data: {
      name: "CRM Automation",
      description:
        "Automate client follow-ups, deal tracking, and sales reporting.",
      status: "ACTIVE",
      workspaceId: workspace.id,
      clientId: sarah.id,
      tasks: {
        create: [
          {
            title: "Design pipeline stages",
            description: "Define Lead, Contacted, Won, and Lost workflow.",
            status: "DONE",
            priority: "MEDIUM",
          },
          {
            title: "Create email follow-up flow",
            description: "Plan automated email sequences for warm leads.",
            status: "TODO",
            priority: "HIGH",
          },
        ],
      },
    },
  });

  await prisma.project.create({
    data: {
      name: "Mobile App MVP",
      description:
        "Plan and ship a lightweight mobile dashboard for managers.",
      status: "COMPLETED",
      workspaceId: workspace.id,
      tasks: {
        create: [
          {
            title: "Finalize MVP scope",
            status: "DONE",
            priority: "HIGH",
          },
          {
            title: "Prepare investor demo",
            status: "DONE",
            priority: "URGENT",
          },
        ],
      },
    },
  });

  console.log("Demo data seeded successfully.");
  console.log("Demo login: demo@flowpilot.com / DemoFlow2026!");
  console.log(`Workspace: ${workspace.name}`);
  console.log(`Main project: ${websiteProject.name}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
