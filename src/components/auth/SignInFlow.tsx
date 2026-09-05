"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { StatusCard } from "@/components/ui/StatusCard";
import { requestOtpAction, verifyOtpAction } from "@/lib/actions/auth";
import { springStandard } from "@/lib/motion";

type Step = "phone" | "otp";

// 3b/9e — OTP sign-in with all four failure states drawn: wrong code,
// expired, too many attempts (lockout — never blocks a purchase, since
// guest checkout doesn't go through this at all), too many requests.
export function SignInFlow() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  function requestOtp() {
    setError(null);
    startTransition(async () => {
      const res = await requestOtpAction(phone);
      if (!res.ok) {
        setError("Too many requests — wait 30 seconds and try again.");
        return;
      }
      setDevCode(res.devCode ?? null);
      setStep("otp");
    });
  }

  function verifyOtp() {
    setError(null);
    startTransition(async () => {
      const res = await verifyOtpAction(phone, code);
      if (!res.ok) {
        setAttemptsLeft(res.attemptsLeft ?? null);
        if (res.error === "EXPIRED") setError("That code has expired — request a new one.");
        else if (res.error === "LOCKED_OUT")
          setError("Too many wrong tries. Request a fresh code to keep going.");
        else setError(`Wrong code. ${res.attemptsLeft ?? 0} tries left.`);
        return;
      }
      router.push("/account");
      router.refresh();
    });
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {error && <StatusCard tone="danger" label="Couldn't sign in" title={error} />}

      {devCode && step === "otp" && (
        <StatusCard
          tone="info"
          label="Sandbox mode — no SMS provider connected"
          title={`Your code is ${devCode}`}
          detail="A real deployment sends this by SMS instead of showing it here."
        />
      )}

      <AnimatePresence mode="wait" initial={false}>
        {step === "phone" ? (
          <motion.div
            key="phone"
            initial={reduceMotion ? undefined : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
            transition={springStandard}
            className="flex flex-col gap-4"
          >
            <Field
              label="Mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
            <Button
              variant="primary"
              onClick={requestOtp}
              loading={pending}
              loadingLabel="Sending…"
              disabled={phone.length < 10}
            >
              Send code
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="otp"
            initial={reduceMotion ? undefined : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
            transition={springStandard}
            className="flex flex-col gap-4"
          >
            <Field
              label="4-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              maxLength={4}
              error={attemptsLeft === 0 ? "No tries left" : undefined}
            />
            <Button
              variant="primary"
              onClick={verifyOtp}
              loading={pending}
              loadingLabel="Verifying…"
              disabled={code.length < 4}
            >
              Verify &amp; continue
            </Button>
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setCode("");
                setError(null);
              }}
              className="text-[13px] text-action hover:underline"
            >
              Use a different number / resend
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
