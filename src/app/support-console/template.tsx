import { PageTransition } from "@/components/chrome/PageTransition";

export default function SupportConsoleTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
