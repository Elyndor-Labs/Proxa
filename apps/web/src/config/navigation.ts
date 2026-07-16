export interface NavItem {
  label: string;
  href: string;
}

/** Primary top navigation — shared across marketing and app shells. */
export const primaryNav: NavItem[] = [
  { label: "Markets", href: "/markets" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Admin", href: "/admin" },
  { label: "Launch", href: "/create" },
  { label: "Governance", href: "/governance" },
];

export const footerNav = {
  social: [
    { label: "Discord", href: "https://discord.gg/proxa" },
    { label: "Twitter", href: "https://twitter.com/proxa" },
  ],
  legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Disclaimer", href: "/terms#disclaimer" },
    { label: "Community Rules", href: "/terms#community" },
  ],
} as const;
