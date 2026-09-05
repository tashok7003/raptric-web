"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { springStandard, useReducedMotion } from "@/lib/motion";
import { StepTracker } from "@/components/ui/StepTracker";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { StatusCard } from "@/components/ui/StatusCard";
import {
  startCheckoutAction,
  choosePaymentMethodAction,
  simulatePaymentOutcomeAction,
} from "@/lib/actions/checkout";
import { emiTenureOptions } from "@/lib/emi";
import { EMI } from "@/lib/siteConfig";

type Step = "delivery" | "payment" | "outcome";
type PaymentMethod = "UPI" | "CARD" | "EMI";

export function CheckoutFlow({
  subtotal,
  emiEligible,
}: {
  subtotal: number;
  emiEligible: boolean;
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState<Step>("delivery");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    pincode: "",
    addressLine: "",
    city: "",
    state: "Karnataka",
  });

  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNo, setOrderNo] = useState<string | null>(null);
  const [total, setTotal] = useState(subtotal);
  const [method, setMethod] = useState<PaymentMethod>("UPI");
  const [tenure, setTenure] = useState(24);
  const [emiState, setEmiState] = useState<
    { status: "APPROVED" | "DECLINED" | "PENDING"; reason?: string } | null
  >(null);
  const [outcome, setOutcome] = useState<"success" | "failed" | "upi_pending" | null>(null);
  const [providerName, setProviderName] = useState<string | null>(null);

  function submitDelivery() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await startCheckoutAction(form);
        setOrderId(res.orderId);
        setOrderNo(res.orderNo);
        setTotal(res.total);
        setStep("payment");
      } catch (e) {
        setError(
          e instanceof Error && e.message === "NOT_SERVICEABLE"
            ? "We don't deliver to this pincode yet — try Find a Store for collect-in-store instead."
            : "Something went wrong. Please check your details and try again.",
        );
      }
    });
  }

  function submitPayment() {
    if (!orderId) return;
    setError(null);
    startTransition(async () => {
      const res = await choosePaymentMethodAction(orderId, method, method === "EMI" ? tenure : undefined);
      setProviderName(res.providerName);
      if (res.emi) {
        setEmiState({
          status: res.emi.status as "APPROVED" | "DECLINED" | "PENDING",
          reason: res.emi.declineReason ?? undefined,
        });
        if (res.emi.status === "DECLINED") return; // stay on payment step, show the fork
      }
      setStep("outcome");
    });
  }

  function simulate(o: "success" | "failed" | "upi_pending") {
    if (!orderId) return;
    startTransition(async () => {
      await simulatePaymentOutcomeAction(orderId, o);
      setOutcome(o);
      if (o === "success") router.push(`/order-confirmation/${orderId}`);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <StepTracker
        steps={[
          { label: "Cart", state: "done" },
          { label: "Delivery", state: step === "delivery" ? "current" : "done" },
          {
            label: "Payment",
            state: step === "payment" ? "current" : step === "outcome" ? "done" : "upcoming",
          },
          { label: "Confirm", state: step === "outcome" ? "current" : "upcoming" },
        ]}
      />

      {error && (
        <StatusCard tone="danger" label="Couldn't continue" title={error} />
      )}

      <AnimatePresence mode="wait" initial={false}>
      {step === "delivery" && (
        <motion.div
          key="delivery"
          initial={reduceMotion ? undefined : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
          transition={springStandard}
          className="flex flex-col gap-4"
        >
          <Field
            label="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Field
            label="Mobile"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            hint="We'll send order updates here — no account required."
          />
          <Field
            label="Address"
            value={form.addressLine}
            onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <Field
              label="Pincode"
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
            />
          </div>
          <Button
            variant="primary"
            onClick={submitDelivery}
            loading={pending}
            loadingLabel="Checking…"
            disabled={!form.name || !form.phone || !form.addressLine || !form.pincode}
          >
            Continue to payment
          </Button>
        </motion.div>
      )}

      {step === "payment" && (
        <motion.div
          key="payment"
          initial={reduceMotion ? undefined : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
          transition={springStandard}
          className="flex flex-col gap-4"
        >
          <div className="flex gap-2">
            <button onClick={() => setMethod("UPI")} type="button">
              <Chip variant={method === "UPI" ? "selected" : "default"}>UPI</Chip>
            </button>
            <button onClick={() => setMethod("CARD")} type="button">
              <Chip variant={method === "CARD" ? "selected" : "default"}>Card</Chip>
            </button>
            {emiEligible && (
              <button onClick={() => setMethod("EMI")} type="button">
                <Chip variant={method === "EMI" ? "selected" : "default"}>
                  {EMI.provider} EMI
                </Chip>
              </button>
            )}
          </div>

          {method === "EMI" && (
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-ink-muted">
                Tenure
              </span>
              <div className="flex flex-wrap gap-2">
                {emiTenureOptions(total).map((opt) => (
                  <button key={opt.tenure} type="button" onClick={() => setTenure(opt.tenure)}>
                    <Chip variant={tenure === opt.tenure ? "selected" : "default"}>
                      {opt.tenure} mo · ₹{opt.monthly.toLocaleString("en-IN")}/mo
                    </Chip>
                  </button>
                ))}
              </div>
              {emiState?.status === "DECLINED" && (
                <StatusCard
                  tone="caution"
                  label="EMI not approved this time"
                  title={emiState.reason ?? "Bajaj couldn't approve this application"}
                  detail="Try a shorter tenure, pay by UPI/card instead, or split it in-store."
                  action={
                    <div className="mt-1 flex flex-wrap gap-2">
                      <Button variant="secondary" onClick={() => setTenure(6)}>
                        Try 6 months
                      </Button>
                      <Button variant="secondary" onClick={() => setMethod("UPI")}>
                        Pay by UPI instead
                      </Button>
                      <Link href="/stores" className="text-[13px] text-action hover:underline self-center">
                        Do it in-store →
                      </Link>
                    </div>
                  }
                />
              )}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
            <span className="font-display text-[18px] font-bold tabular-nums">
              ₹{total.toLocaleString("en-IN")}
            </span>
            <Button
              variant="primary"
              onClick={submitPayment}
              loading={pending}
              loadingLabel="Processing…"
            >
              {method === "EMI" ? "Apply & pay" : "Pay now"}
            </Button>
          </div>
        </motion.div>
      )}

      {step === "outcome" && (
        <motion.div
          key="outcome"
          initial={reduceMotion ? undefined : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
          transition={springStandard}
          className="flex flex-col gap-4"
        >
          {providerName === "mock" && !outcome && (
            <>
              <StatusCard
                tone="info"
                label="Sandbox mode"
                title="No live payment gateway connected yet"
                detail={`Order ${orderNo} is created — choose an outcome to continue as if ${method === "UPI" ? "your bank" : "the gateway"} responded.`}
              />
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" onClick={() => simulate("success")}>
                  Simulate: Paid
                </Button>
                <Button variant="secondary" onClick={() => simulate("failed")}>
                  Simulate: Failed
                </Button>
                {method === "UPI" && (
                  <Button variant="secondary" onClick={() => simulate("upi_pending")}>
                    Simulate: UPI pending
                  </Button>
                )}
              </div>
            </>
          )}

          {outcome === "failed" && (
            <StatusCard
              tone="danger"
              label="Payment failed"
              title="Nothing was charged"
              detail="Your cart is held for 24 hours — try again or use a different method."
              action={
                <Button variant="primary" onClick={() => setStep("payment")}>
                  Try again
                </Button>
              }
            />
          )}

          {outcome === "upi_pending" && (
            <StatusCard
              tone="caution"
              label="Waiting on your bank"
              title="Still confirming — don't pay again"
              detail="This can take up to 90 seconds. We'll text you the moment it clears, and hold your order for 30 minutes either way."
              action={
                <Button
                  variant="secondary"
                  onClick={() => simulate("success")}
                  loading={pending}
                >
                  Check status
                </Button>
              }
            />
          )}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
