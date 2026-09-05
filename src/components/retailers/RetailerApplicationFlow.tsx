"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { StatusCard } from "@/components/ui/StatusCard";
import { checkTerritoryAction, submitRetailerApplicationAction } from "@/lib/actions/retailer";
import { springStandard, useReducedMotion } from "@/lib/motion";

type Step = "territory" | "application" | "done";

export function RetailerApplicationFlow() {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState<Step>("territory");
  const [pincode, setPincode] = useState("");
  const [taken, setTaken] = useState<boolean | null>(null);
  const [form, setForm] = useState({ name: "", ownerName: "", phone: "" });
  const [pending, startTransition] = useTransition();

  function checkTerritory() {
    startTransition(async () => {
      const res = await checkTerritoryAction(pincode);
      setTaken(res.taken);
      if (!res.taken) setStep("application");
    });
  }

  function submit() {
    startTransition(async () => {
      await submitRetailerApplicationAction({ ...form, territoryPin: pincode });
      setStep("done");
    });
  }

  return (
    <div className="mt-8">
      <AnimatePresence mode="wait" initial={false}>
        {step === "territory" && (
          <motion.div
            key="territory"
            initial={reduceMotion ? undefined : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
            transition={springStandard}
            className="flex max-w-sm flex-col gap-3"
          >
            <Field
              label="Your area pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
            />
            {taken === true && (
              <StatusCard
                tone="caution"
                label="Territory taken"
                title="We already have a retailer in this area"
                detail="We keep 8km exclusivity between stores. Leave your details and we'll flag you if it opens up."
              />
            )}
            <Button variant="primary" loading={pending} disabled={!pincode} onClick={checkTerritory}>
              Check my area
            </Button>
          </motion.div>
        )}

        {step === "application" && (
          <motion.div
            key="application"
            initial={reduceMotion ? undefined : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
            transition={springStandard}
            className="flex max-w-sm flex-col gap-3"
          >
            <Field
              label="Store name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Field
              label="Owner name"
              value={form.ownerName}
              onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
            />
            <Field
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Button
              variant="primary"
              loading={pending}
              disabled={!form.name || !form.ownerName || !form.phone}
              onClick={submit}
            >
              Submit application
            </Button>
          </motion.div>
        )}

        {step === "done" && (
          <motion.div
            key="done"
            initial={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springStandard}
          >
            <StatusCard
              tone="success"
              label="Application received"
              title="We'll call within 3 working days"
              detail={`Territory: ${pincode}`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
