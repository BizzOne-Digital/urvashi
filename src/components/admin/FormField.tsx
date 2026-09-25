import { cn } from "@/lib/utils";

export function FormField({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-sm font-medium text-ink-black">{label}</label>
      {children}
      {error && <p className="text-sm text-deep-magenta">{error}</p>}
    </div>
  );
}

export const inputClass =
  "w-full rounded-md border border-chrome-light/40 bg-white px-3 py-2 text-sm text-ink-black placeholder:text-chrome-mid focus:border-royal-blue focus:outline-none focus:ring-1 focus:ring-royal-blue";

export const textareaClass =
  "w-full rounded-md border border-chrome-light/40 bg-white px-3 py-2 text-sm text-ink-black placeholder:text-chrome-mid focus:border-royal-blue focus:outline-none focus:ring-1 focus:ring-royal-blue min-h-[100px]";

export const selectClass = inputClass;
