import {
  BookOpen,
  Gavel,
  LayoutDashboard,
  LineChart,
  Plus,
  Trophy,
  type LucideIcon,
  Wallet,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
}

/** Top navigation links shared across marketing header and app header. */
export const primaryNav: NavItem[] = [
  { label: "Markets", href: "/markets" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Docs", href: "/dev-hub" },
];

/** Sidebar navigation for the app shell. */
export const appNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Live Markets", href: "/markets", icon: LineChart },
  { label: "Create Market", href: "/create", icon: Plus },
  { label: "Portfolio", href: "/portfolio", icon: Wallet },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { label: "Dev Hub", href: "/dev-hub", icon: BookOpen },
  { label: "Governance", href: "/governance", icon: Gavel },
];

export const footerNav = {
  product: [
    { label: "Markets", href: "/markets" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Governance", href: "/governance" },
  ],
  resources: [
    { label: "Dev Hub", href: "/dev-hub" },
    { label: "Design System", href: "/design-system" },
    { label: "Merkle Proofs", href: "/dev-hub#merkle" },
  ],
  legal: [
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
  ],
} as const;
