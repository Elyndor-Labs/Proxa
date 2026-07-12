/** Radial glow — brand green bloom fading into the page background. */
export default function GradientGlowFade({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={className}
      style={{
        background:
          "radial-gradient(125% 125% at 50% 0%, transparent 35%, rgba(74, 222, 128, 0.12) 55%, var(--background) 100%)",
      }}
    />
  );
}
