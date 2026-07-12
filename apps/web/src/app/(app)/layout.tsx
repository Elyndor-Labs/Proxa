import { AppShell } from "@/components/layout/app-shell";

/** App layout — top nav shell with bet slip. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
