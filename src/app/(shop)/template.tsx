import { PageTransition } from "@/components/chrome/PageTransition";

export default function ShopTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
