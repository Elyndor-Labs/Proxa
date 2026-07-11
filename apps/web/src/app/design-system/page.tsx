import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { siteConfig } from "@/config/site";

const PALETTE = [
  { name: "Brand", className: "bg-brand" },
  { name: "Secondary", className: "bg-secondary" },
  { name: "Tertiary", className: "bg-tertiary" },
  { name: "Background", className: "bg-background border border-border" },
  { name: "Card", className: "bg-card border border-border" },
  { name: "Muted", className: "bg-muted" },
] as const;

const BUTTON_VARIANTS = ["default", "secondary", "inverted", "outline", "brand", "ghost"] as const;

const BADGE_VARIANTS = ["default", "secondary", "brand", "outline", "muted", "success", "warning"] as const;

/** Internal layout primitives — scoped to this preview page only. */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function ColorSwatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="space-y-2">
      <div className={`h-14 w-full rounded-lg ${className}`} />
      <p className="font-label text-xs text-muted-foreground">{name}</p>
    </div>
  );
}

/** Living style guide for the Velocity Grid token system. */
export default function DesignSystemPage() {
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-[var(--container-padding)] py-10 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-label text-sm uppercase tracking-widest text-muted-foreground">Velocity Grid</p>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{siteConfig.name} Design System</h1>
        </div>
        <ThemeToggle />
      </header>

      <div className="space-y-12">
        <Section title="Color Palette">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {PALETTE.map((color) => (
              <ColorSwatch key={color.name} name={color.name} className={color.className} />
            ))}
          </div>
        </Section>

        <Section title="Typography">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <p className="font-display text-3xl font-bold">Archivo Narrow — Headlines</p>
              <p className="font-sans text-base">Inter — Body copy for descriptions and UI text.</p>
              <p className="font-label text-sm text-muted-foreground">Geist — Labels, buttons, metadata</p>
              <p className="font-mono text-sm text-secondary">7fC2a3…3F4D0 — Monospace / addresses</p>
            </CardContent>
          </Card>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap gap-3">
            {BUTTON_VARIANTS.map((variant) => (
              <Button key={variant} variant={variant}>
                {variant.charAt(0).toUpperCase() + variant.slice(1)}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg" variant="brand">
              Large
            </Button>
          </div>
        </Section>

        <Section title="Input">
          <div className="max-w-sm">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search" aria-label="Search" />
            </div>
          </div>
        </Section>

        <Section title="Badges">
          <div className="flex flex-wrap gap-2">
            {BADGE_VARIANTS.map((variant) => (
              <Badge key={variant} variant={variant}>
                {variant}
              </Badge>
            ))}
          </div>
        </Section>

        <Section title="Cards">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Merkle Security</CardTitle>
                <CardDescription>On-chain proof verification via TxLINE oracle.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-brand/30">
              <CardHeader>
                <CardTitle className="text-brand">Live Market</CardTitle>
                <CardDescription>Featured card with brand accent border.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="brand" className="w-full">
                  Place Bet
                </Button>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section title="Progress / Skeleton">
          <div className="space-y-2">
            <div className="h-2 w-full rounded-full bg-muted">
              <div className="h-2 w-3/5 rounded-full bg-secondary" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
