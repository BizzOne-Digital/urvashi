import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface DpmProductMarkProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  centered?: boolean;
}

export function DpmProductMark({ className, size = "sm", centered = false }: DpmProductMarkProps) {
  const sizeClass =
    size === "lg" ? "text-4xl sm:text-5xl" : size === "md" ? "text-base sm:text-lg" : "text-sm sm:text-base";

  if (centered) {
    return (
      <span
        className={cn(
          "pointer-events-none absolute inset-0 z-[1] flex items-center justify-center font-display font-bold italic tracking-tight text-royal-blue/12",
          sizeClass,
          className
        )}
        aria-hidden
      >
        DPM
      </span>
    );
  }

  return (
    <span
      className={cn(
        "dpm-product-mark pointer-events-none absolute bottom-2 right-2 z-10 font-display font-bold italic tracking-tight text-royal-blue drop-shadow-sm sm:bottom-3 sm:right-3",
        sizeClass,
        className
      )}
      aria-hidden
    >
      DPM
    </span>
  );
}

interface DpmProductImageProps extends ImageProps {
  showDpmMark?: boolean;
  centeredMark?: boolean;
  markSize?: "sm" | "md" | "lg";
  imageClassName?: string;
}

export function DpmProductImage({
  showDpmMark = true,
  centeredMark = true,
  markSize = "md",
  className,
  imageClassName,
  alt,
  ...props
}: DpmProductImageProps) {
  return (
    <>
      {showDpmMark && centeredMark && <DpmProductMark centered size={markSize} />}
      <Image alt={alt} className={cn(imageClassName, className)} {...props} />
      {showDpmMark && !centeredMark && <DpmProductMark size={markSize} />}
    </>
  );
}
