import type { Metadata } from "next";

/** Shared page metadata factory. */
export function createPageMetadata(title: string, description?: string): Metadata {
  return {
    title,
    description,
  };
}
