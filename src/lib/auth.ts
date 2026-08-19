import CredentialsProvider from "next-auth/providers/credentials";
import type { Session } from "next-auth";
import bcrypt from "bcryptjs";
import { connectDB } from "./db";
import AdminUser from "@/models/AdminUser";

type AuthToken = Record<string, unknown> & { id?: string };

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();
        const user = await AdminUser.findOne({
          email: credentials.email.toLowerCase(),
          isActive: true,
        });

        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        user.lastLoginAt = new Date();
        await user.save();

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 8 * 60 * 60,
  },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }: { token: AuthToken; user?: { id: string } | null }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: AuthToken }) {
      if (session.user && token.id) {
        (session.user as { id?: string }).id = token.id;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
};
