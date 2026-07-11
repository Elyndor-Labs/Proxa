import { AppShell } from "@/components/layout/app-shell";

/** App layout — sidebar + header + bet slip, no marketing footer. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
