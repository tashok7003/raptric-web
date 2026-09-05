import "server-only";
import { cookies } from "next/headers";
import { db } from "./db";

const SESSION_COOKIE = "raptric_session";

export async function createSession(userId: string, device?: string) {
  const session = await db.session.create({ data: { userId, device } });
  const store = await cookies();
  store.set(SESSION_COOKIE, session.id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
  return session;
}

export async function getCurrentUser() {
  const store = await cookies();
  const sessionId = store.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const session = await db.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });
  if (!session || session.revokedAt) return null;
  return session.user;
}

export async function destroySession() {
  const store = await cookies();
  const sessionId = store.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    await db.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    }).catch(() => {});
  }
  store.delete(SESSION_COOKIE);
}
