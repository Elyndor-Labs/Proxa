import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Global 404 page. */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-label text-sm text-muted-foreground">404</p>
      <h1 className="font-display text-3xl font-bold">Page not found</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The page you are looking for does not exist or may have been moved.
      </p>
      <div className="flex gap-2">
        <Button variant="brand" asChild>
          <Link href="/markets">Browse Markets</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
