import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators/auth";
import { checkRateLimit, requestAddress } from "@/lib/rate-limit";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  providers: [
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
