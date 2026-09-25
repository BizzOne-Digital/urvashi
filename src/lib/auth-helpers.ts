import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";

export type AdminSession = {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
  };
};

type SessionUser = {
  id?: string;
  email?: string | null;
  name?: string | null;
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;

  if (!user?.id && !user?.email) return null;

  return {
    user: {
      id: user.id || user.email!,
      email: user.email,
      name: user.name,
    },
  };
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
