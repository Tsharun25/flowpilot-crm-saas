import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators/auth";
import { checkRateLimit, requestAddress } from "@/lib/rate-limit";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function POST(request: Request) {
  try {
    const rate = await checkRateLimit("register", requestAddress(request.headers), 5, 60 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { message: "Too many registration attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
      );
    }
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Request body must be valid JSON" },
        { status: 400 },
      );
    }

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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { message: "Unable to create this account. Try signing in or use a different email." },
        { status: 409 }
      );
    }

    console.error("REGISTER_ERROR", error);

    return NextResponse.json(
      {
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
