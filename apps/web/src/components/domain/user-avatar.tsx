import Image from "next/image";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
}

/** Circular user PFP — falls back to the shared default illustration. */
export function UserAvatar({
  src,
  alt = "",
  size = 28,
  className,
}: UserAvatarProps) {
  return (
    <Image
      src={src || siteConfig.defaultAvatar}
      alt={alt}
      width={size}
      height={size}
      className={cn("user-avatar", className)}
    />
  );
}
