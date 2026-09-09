import { cn } from "@/lib/utils";

interface UploadArtworkPlaceholderProps {
  className?: string;
  label?: string;
}

export function UploadArtworkPlaceholder({
  className,
  label = "Upload your image or logo",
}: UploadArtworkPlaceholderProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-2 border border-dashed border-cyan/35 bg-gradient-to-br from-[#0a0c14] to-[#12141c] p-3 text-center",
        className
      )}
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan/30 bg-cyan/10 text-lg text-cyan"
        aria-hidden
      >
        ↑
      </span>
      <p className="text-[10px] font-semibold leading-snug text-cyan sm:text-xs">{label}</p>
    </div>
  );
}
