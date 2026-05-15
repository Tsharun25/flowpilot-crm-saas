import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const demoEmail = "demo@flowpilot.com";

  const user = await prisma.user.findUnique({
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
    console.log("Demo user not found.");
    console.log("First register with email: demo@flowpilot.com");
    return;
  }

  const workspace = user.memberships[0]?.workspace;

  if (!workspace) {
    console.log("Workspace not found.");
    return;
  }

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

  const websiteProject = await prisma.project.create({
    data: {
      name: "Website Redesign",
      description:
        "Modern marketing website redesign for a growing SaaS brand.",
      status: "ACTIVE",
      workspaceId: workspace.id,
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

  await prisma.client.createMany({
    data: [
      {
        name: "Mario Rossi",
        company: "Rossi Digital",
        email: "mario@example.com",
        value: 500000,
        status: "WON",
        workspaceId: workspace.id,
      },
      {
        name: "Sarah Khan",
        company: "LaunchLab",
        email: "sarah@example.com",
        value: 120000,
        status: "CONTACTED",
        workspaceId: workspace.id,
      },
      {
        name: "Daniel Lee",
        company: "Northstar Apps",
        email: "daniel@example.com",
        value: 85000,
        status: "LEAD",
        workspaceId: workspace.id,
      },
      {
        name: "Ayesha Rahman",
        company: "BrightWorks",
        email: "ayesha@example.com",
        value: 45000,
        status: "LOST",
        workspaceId: workspace.id,
      },
    ],
  });

  console.log("Demo data seeded successfully.");
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