import { cn } from "@/lib/utils";

interface CodeBlockProps {
  children: string;
  className?: string;
}

/** Syntax-styled monospace code block for Dev Hub. */
export function CodeBlock({ children, className }: CodeBlockProps) {
  return (
    <pre
      className={cn(
        "overflow-x-auto rounded-lg border border-border bg-background p-4 font-mono text-xs leading-relaxed text-muted-foreground",
        className,
      )}
    >
      <code>{children}</code>
    </pre>
  );
}
