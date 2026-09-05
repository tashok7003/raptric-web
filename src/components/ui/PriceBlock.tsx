import { cn } from "@/lib/cn";

interface EmiPriceProps {
  form: "emi";
  monthly: number;
  tenureMonths: number;
  mrp: number;
  price: number;
  className?: string;
}

interface FlatPriceProps {
  form: "flat";
  price: number;
  note?: string; // e.g. "mBike — no EMI under ₹20,000"
  className?: string;
}

// 10e — "two forms only. Any third pricing treatment on any screen is a
// bug." Price is a type token (8e): 20px/600, tabular numerals always.
export function PriceBlock(props: EmiPriceProps | FlatPriceProps) {
  if (props.form === "flat") {
    return (
      <div className={cn("flex flex-col gap-0.5", props.className)}>
        <div className="font-display text-[20px] font-semibold tabular-nums text-ink">
          ₹{props.price.toLocaleString("en-IN")}
        </div>
        {props.note && (
          <span className="text-[12px] text-ink-muted">{props.note}</span>
        )}
      </div>
    );
  }

  const { monthly, tenureMonths, mrp, price, className } = props;
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <div className="font-display text-[20px] font-semibold tabular-nums text-ink">
        ₹{monthly.toLocaleString("en-IN")}
        <span className="text-[12px] font-normal text-ink-muted">/mo</span>
      </div>
      <span className="text-[12px] font-mono-token text-ink-muted">
        {tenureMonths} mo · no cost
      </span>
      <div className="flex items-baseline gap-1.5">
        {mrp > price && (
          <span className="text-[12px] text-ink-muted/60 line-through">
            ₹{mrp.toLocaleString("en-IN")}
          </span>
        )}
        <span className="text-[12px] font-semibold text-ink-muted">
          ₹{price.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
}
