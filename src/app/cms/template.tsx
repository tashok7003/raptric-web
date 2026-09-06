import { PageTransition } from "@/components/chrome/PageTransition";

export default function CmsTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
