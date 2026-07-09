interface PageHeaderProps {
  title: string;
  description?: string;
}

/** Consistent page title block for app routes. */
export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>}
    </header>
  );
}
