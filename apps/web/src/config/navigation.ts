export interface NavItem {
  label: string;
  href: string;
}

/** Primary top navigation — shared across marketing and app shells. */
export const primaryNav: NavItem[] = [
  { label: "Markets", href: "/markets" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Make Markets", href: "/create" },
  // { label: "Governance", href: "/governance" },
];

export const footerNav = {
  social: [
    { label: "Twitter" },
  ],
  legal: [
    { label: "Terms of Service" },
    { label: "Privacy Policy" },
    { label: "Disclaimer" },
    { label: "Community Rules" },
  ],
} as const;
