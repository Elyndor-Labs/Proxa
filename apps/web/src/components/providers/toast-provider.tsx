import { Toaster } from "sonner";

/** Global toast container — styled for Velocity Grid dark theme. */
export function ToastProvider() {
  return (
    <Toaster
      theme="dark"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "border border-border bg-card text-foreground font-label",
          success: "border-brand/30",
          error: "border-destructive/30",
        },
      }}
    />
  );
}
