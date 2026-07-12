export default function MarketingLoading() {
  return (
    <div className="space-y-12 px-[var(--container-padding)] py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-4 text-center">
        <div className="mx-auto h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="mx-auto h-12 w-full max-w-2xl animate-pulse rounded-xl bg-muted" />
        <div className="mx-auto h-6 w-full max-w-xl animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="mx-auto h-64 max-w-lg animate-pulse rounded-xl bg-muted" />
    </div>
  );
}
