import "server-only";

/**
 * SMS/WhatsApp provider — no real account exists yet (12d's launch
 * blocker list: "SMS sender ID RAPTRC registration", DLT templates from
 * 12a). Until SMS_PROVIDER_API_KEY is set, sendSms logs the message and
 * returns it in the result so calling code (OTP screens, order
 * notifications) can surface it directly in the UI — the same
 * sandbox-mode convention used in src/lib/payments.
 */
export interface SendSmsResult {
  sent: boolean;
  sandbox: boolean;
  body: string;
}

export async function sendSms(phone: string, body: string): Promise<SendSmsResult> {
  if (process.env.SMS_PROVIDER_API_KEY) {
    // Real provider (Gupshup/Twilio/etc.) would be called here once
    // SMS_PROVIDER_API_KEY exists. Intentionally unimplemented until then.
    throw new Error("Real SMS provider not yet wired up.");
  }
  console.log(`[sms:sandbox] to ${phone}: ${body}`);
  return { sent: false, sandbox: true, body };
}
