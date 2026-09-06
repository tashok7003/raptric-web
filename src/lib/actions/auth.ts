"use server";

import { db } from "@/lib/db";
import { sendSms } from "@/lib/sms";
import { createSession, destroySession } from "@/lib/session";

const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 30;

function generateCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/** Every seeded/stored phone is E.164 (+91XXXXXXXXXX), but the sign-in
 * form accepts whatever a rider types — a bare 10-digit number matching
 * the seeded admin's own phone was silently creating a second, distinct
 * RIDER account instead of matching it. India-only for now, matching the
 * DLT templates and Bajaj EMI integration, which are India-specific. */
function normalizePhone(raw: string): string {
  const kept = raw.replace(/[^\d+]/g, "");
  if (kept.startsWith("+")) return kept;
  const bare = kept.replace(/^0+/, "");
  if (bare.length === 12 && bare.startsWith("91")) return `+${bare}`;
  if (bare.length === 10) return `+91${bare}`;
  return `+${bare}`;
}

export interface RequestOtpResult {
  ok: boolean;
  error?: "TOO_MANY_REQUESTS";
  devCode?: string; // only set in sandbox mode (no real SMS provider)
}

// 3b — one door for new and returning riders; 9e's OTP failure states
// start here (too-many-requests) and continue in verifyOtpAction.
export async function requestOtpAction(rawPhone: string): Promise<RequestOtpResult> {
  const phone = normalizePhone(rawPhone);
  const recent = await db.otpCode.findFirst({
    where: { phone, createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000) } },
    orderBy: { createdAt: "desc" },
  });
  if (recent) return { ok: false, error: "TOO_MANY_REQUESTS" };

  const code = generateCode();
  await db.otpCode.create({
    data: {
      phone,
      code,
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
    },
  });

  const result = await sendSms(
    phone,
    `${code} is your RAPTRIC code. Valid 10 minutes. Don't share it with anyone, including us. — RAPTRIC`,
  );

  return { ok: true, devCode: result.sandbox ? code : undefined };
}

export interface VerifyOtpResult {
  ok: boolean;
  error?: "WRONG_CODE" | "EXPIRED" | "LOCKED_OUT";
  attemptsLeft?: number;
}

export async function verifyOtpAction(rawPhone: string, code: string): Promise<VerifyOtpResult> {
  const phone = normalizePhone(rawPhone);
  const otp = await db.otpCode.findFirst({
    where: { phone, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) return { ok: false, error: "WRONG_CODE", attemptsLeft: 0 };

  if (otp.attempts >= MAX_ATTEMPTS) {
    return { ok: false, error: "LOCKED_OUT" };
  }

  if (otp.expiresAt < new Date()) {
    return { ok: false, error: "EXPIRED" };
  }

  if (otp.code !== code) {
    const updated = await db.otpCode.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    const attemptsLeft = MAX_ATTEMPTS - updated.attempts;
    return {
      ok: false,
      error: attemptsLeft <= 0 ? "LOCKED_OUT" : "WRONG_CODE",
      attemptsLeft: Math.max(attemptsLeft, 0),
    };
  }

  await db.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

  const user = await db.user.upsert({
    where: { phone },
    update: {},
    create: { phone },
  });

  await createSession(user.id);
  return { ok: true };
}

export async function signOutAction() {
  await destroySession();
}
