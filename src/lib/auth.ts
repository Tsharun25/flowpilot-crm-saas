import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators/auth";
import { checkRateLimit, requestAddress } from "@/lib/rate-limit";
import { DEMO_ACCOUNTS } from "@/lib/demo-accounts";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    CredentialsProvider({
      id: "demo",
      name: "Role demo",
      credentials: {
        role: { label: "Role", type: "text" },
      },

      async authorize(credentials, request) {
        const account = DEMO_ACCOUNTS.find(({ role }) => role === credentials?.role);
        if (!account) return null;

        const address = requestAddress(new Headers(request.headers as Record<string, string>));
        const rate = await checkRateLimit("demo-login", `${address}:${account.role}`, 30, 15 * 60 * 1000);
        if (!rate.allowed) return null;

        const user = await prisma.user.findUnique({
          where: { email: account.email },
          include: {
            memberships: {
              where: { role: account.role, workspace: { isDemo: true } },
              select: { id: true },
              take: 1,
            },
          },
        });

        if (!user || user.memberships.length !== 1) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          sessionVersion: user.sessionVersion ?? 0,
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const address = requestAddress(new Headers(request.headers as Record<string, string>));
        const rate = await checkRateLimit("login", `${address}:${email}`, 10, 15 * 60 * 1000);
        if (!rate.allowed) return null;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) return null;

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          sessionVersion: user.sessionVersion ?? 0,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.sessionVersion = user.sessionVersion;
        token.invalidated = false;
      } else if (token.id) {
        const current = await prisma.user.findUnique({
          where: { id: token.id },
          select: { sessionVersion: true },
        });
        token.invalidated =
          !current || (current.sessionVersion ?? 0) !== token.sessionVersion;
      }

      return token;
    },

    async session({ session, token }) {
      if (token.invalidated || !token.id) {
        return { expires: new Date(0).toISOString() } as typeof session;
      }
      if (session.user) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
};
