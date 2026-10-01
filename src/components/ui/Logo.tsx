import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Supplied logo aspect ratio: 1663 × 946 */
const LOGO_ASPECT = 946 / 1663;

export interface LogoProps {
  src?: string;
  alt?: string;
  href?: string;
  className?: string;
  imageClassName?: string;
  plaqueClassName?: string;
  priority?: boolean;
  /** header = compact nav bar; hero = larger display */
  variant?: "header" | "headerHome" | "default";
}

const variantStyles = {
  header: {
    image: "h-9 w-auto max-w-[130px] sm:h-10 lg:max-w-[150px]",
    plaque: "px-2 py-1",
  },
  headerHome: {
    image: "h-8 w-auto max-w-[min(calc(100vw-11rem),160px)] object-contain object-left sm:h-10 sm:max-w-[140px] lg:h-12 lg:max-w-[165px]",
    plaque: "px-2 py-1 sm:px-2.5 sm:py-1.5",
  },
  default: {
    image: "h-auto w-full max-w-[180px] object-contain",
    plaque: "p-3",
  },
} as const;

export function Logo({
  src = "/brand/dpm-logo.png",
  alt = "DPM Custom Prints",
  href = "/",
  className,
  imageClassName,
  plaqueClassName,
  priority = false,
  variant = "default",
}: LogoProps) {
  const styles = variantStyles[variant];
  const height = variant === "default" ? Math.round(180 * LOGO_ASPECT) : Math.round(165 * LOGO_ASPECT);

  const content = (
    <span
      className={cn(
        "inline-flex max-w-full items-center justify-center overflow-visible rounded-sm bg-pure-paper shadow-sm",
        styles.plaque,
        plaqueClassName
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={1663}
        height={946}
        className={cn("object-contain object-left", styles.image, imageClassName)}
        style={variant === "default" ? { width: 180, height } : undefined}
        priority={priority}
      />
    </span>
  );

  if (href) {
    return (
      <Link href={href} className={cn("inline-flex shrink-0 items-center", className)} aria-label={alt}>
        {content}
      </Link>
    );
  }

  return <div className={cn("inline-flex shrink-0 items-center", className)}>{content}</div>;
}
