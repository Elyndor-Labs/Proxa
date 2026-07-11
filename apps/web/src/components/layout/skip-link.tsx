/** Skip navigation link for keyboard and screen reader users. */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:border focus:border-border focus:bg-background focus:px-4 focus:py-2 focus:font-label focus:text-sm focus:shadow-lg"
    >
      Skip to main content
    </a>
  );
}
