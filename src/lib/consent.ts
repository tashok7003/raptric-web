import "server-only";
import { cookies } from "next/headers";

export const CONSENT_COOKIE = "raptric_consent";

export type ConsentChoice = "accepted" | "necessary_only" | null;

export async function getConsentChoice(): Promise<ConsentChoice> {
  const store = await cookies();
  const value = store.get(CONSENT_COOKIE)?.value;
  return value === "accepted" || value === "necessary_only" ? value : null;
}
