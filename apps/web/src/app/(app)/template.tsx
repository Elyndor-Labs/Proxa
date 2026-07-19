import { PageTransition } from "@/components/ui/page-transition";

/** App route transition wrapper — fade + slight upward slide on navigation. */
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
