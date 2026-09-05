"use client";

import { useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { StatusCard } from "@/components/ui/StatusCard";
import { StepTracker } from "@/components/ui/StepTracker";
import { bookTestRideAction } from "@/lib/actions/testRide";
import { springStandard, useReducedMotion } from "@/lib/motion";

type Step = "bike" | "store" | "slot" | "contact" | "done";

interface Model {
  id: string;
  name: string;
  slug: string;
}
interface Store {
  id: string;
  name: string;
  city: string;
}

function nextSlots() {
  const slots: Date[] = [];
  const now = new Date();
  for (let d = 1; d <= 3; d++) {
    for (const hour of [11, 14, 17]) {
      const slot = new Date(now);
      slot.setDate(slot.getDate() + d);
      slot.setHours(hour, 0, 0, 0);
      slots.push(slot);
    }
  }
  return slots;
}

export function TestRideFlow({
  models,
  stores,
  preselectedSlug,
}: {
  models: Model[];
  stores: Store[];
  preselectedSlug?: string;
}) {
  const reduceMotion = useReducedMotion();
  const preselected = models.find((m) => m.slug === preselectedSlug);
  const [step, setStep] = useState<Step>(preselected ? "store" : "bike");
  const [modelId, setModelId] = useState<string | undefined>(preselected?.id);
  const [storeId, setStoreId] = useState<string | undefined>(stores[0]?.id);
  const [slot, setSlot] = useState<Date | undefined>();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pending, startTransition] = useTransition();
  const [confirmed, setConfirmed] = useState<{ model: string; store: string; slot: Date } | null>(
    null,
  );

  const slots = useMemo(nextSlots, []);
  const selectedModel = models.find((m) => m.id === modelId);
  const selectedStore = stores.find((s) => s.id === storeId);

  function submit() {
    if (!modelId || !storeId || !slot) return;
    startTransition(async () => {
      await bookTestRideAction({ modelId, storeId, slot: slot.toISOString(), name, phone });
      setConfirmed({ model: selectedModel!.name, store: selectedStore!.name, slot });
      setStep("done");
    });
  }

  const stepOrder: Step[] = ["bike", "store", "slot", "contact", "done"];
  const stepIndex = stepOrder.indexOf(step);

  return (
    <div className="mt-6 flex flex-col gap-6">
      {step !== "done" && (
        <StepTracker
          steps={["Bike", "Store", "Slot", "Details"].map((label, i) => ({
            label,
            state: i < stepIndex ? "done" : i === stepIndex ? "current" : "upcoming",
          }))}
        />
      )}

      <AnimatePresence mode="wait" initial={false}>
        {step === "bike" && (
          <motion.div
            key="bike"
            initial={reduceMotion ? undefined : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
            transition={springStandard}
            className="flex flex-col gap-3"
          >
            <div className="flex flex-wrap gap-2">
              {models.map((m) => (
                <button key={m.id} type="button" onClick={() => setModelId(m.id)}>
                  <Chip variant={modelId === m.id ? "selected" : "default"}>{m.name}</Chip>
                </button>
              ))}
            </div>
            <Button variant="primary" disabled={!modelId} onClick={() => setStep("store")}>
              Continue
            </Button>
          </motion.div>
        )}

        {step === "store" && (
          <motion.div
            key="store"
            initial={reduceMotion ? undefined : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
            transition={springStandard}
            className="flex flex-col gap-3"
          >
            <div className="flex flex-wrap gap-2">
              {stores.map((s) => (
                <button key={s.id} type="button" onClick={() => setStoreId(s.id)}>
                  <Chip variant={storeId === s.id ? "selected" : "default"}>
                    {s.name} · {s.city}
                  </Chip>
                </button>
              ))}
            </div>
            <Button variant="primary" disabled={!storeId} onClick={() => setStep("slot")}>
              Continue
            </Button>
          </motion.div>
        )}

        {step === "slot" && (
          <motion.div
            key="slot"
            initial={reduceMotion ? undefined : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
            transition={springStandard}
            className="flex flex-col gap-3"
          >
            <div className="grid grid-cols-3 gap-2">
              {slots.map((s) => (
                <button key={s.toISOString()} type="button" onClick={() => setSlot(s)}>
                  <Chip variant={slot?.getTime() === s.getTime() ? "selected" : "default"}>
                    {s.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" })}
                    <br />
                    {s.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                  </Chip>
                </button>
              ))}
            </div>
            <Button variant="primary" disabled={!slot} onClick={() => setStep("contact")}>
              Continue
            </Button>
          </motion.div>
        )}

        {step === "contact" && (
          <motion.div
            key="contact"
            initial={reduceMotion ? undefined : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
            transition={springStandard}
            className="flex flex-col gap-4"
          >
            <Field label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            <Field
              label="Mobile"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              hint="We'll text a reminder 24 hours before."
            />
            <Button
              variant="primary"
              onClick={submit}
              loading={pending}
              loadingLabel="Booking…"
              disabled={!name || !phone}
            >
              Confirm test ride
            </Button>
          </motion.div>
        )}

        {step === "done" && confirmed && (
          <motion.div
            key="done"
            initial={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springStandard}
          >
            <StatusCard
              tone="success"
              label="Test ride booked"
              title={`${confirmed.model} at ${confirmed.store}`}
              detail={`${confirmed.slot.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}, ${confirmed.slot.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })} — bring any ID. We'll text a reminder 24 hours before.`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
