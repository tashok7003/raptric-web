import { PageTransition } from "@/components/chrome/PageTransition";

export default function OpsTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
