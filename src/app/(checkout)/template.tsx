import { PageTransition } from "@/components/chrome/PageTransition";

export default function CheckoutTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
