"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function CustomerSearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState(searchParams.get("phone") ?? "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/support-console?phone=${encodeURIComponent(phone)}`);
      }}
      className="mt-4 flex max-w-md items-end gap-2"
    >
      <div className="flex-1">
        <Field label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <Button variant="primary" type="submit">
        Search
      </Button>
    </form>
  );
}
