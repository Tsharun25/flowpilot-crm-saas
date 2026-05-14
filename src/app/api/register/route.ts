import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators/auth";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: parsed.error.issues[0]?.message || "Invalid input",
        },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const baseSlug = slugify(`${name}-workspace`);
    const workspaceSlug = `${baseSlug}-${Date.now()}`;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        memberships: {
          create: {
            role: "OWNER",
            workspace: {
              create: {
                name: `${name}'s Workspace`,
                slug: workspaceSlug,
              },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER_ERROR", error);

    return NextResponse.json(
      {
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}