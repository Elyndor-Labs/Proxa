/** Shared motion timing — keep tactile transitions consistent app-wide. */
export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2, ease: "easeOut" as const },
};

export const cardHover = {
  whileHover: { scale: 1.015 },
  transition: { duration: 0.15, ease: "easeOut" as const },
};

export const emptyStateIcon = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: "easeOut" as const },
};
