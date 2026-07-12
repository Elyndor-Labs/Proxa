interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

/** Page title block with gradient heading and motion. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="animate-slide-up mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="page-title">{title}</h1>
        {description && (
          <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {actions}
    </header>
  );
}
