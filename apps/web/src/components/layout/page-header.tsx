interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

/** Consistent page title block for app routes. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>}
      </div>
      {actions}
    </header>
  );
}
