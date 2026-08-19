import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  published: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  draft: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  archived: "bg-chrome-mid/20 text-chrome-light border-chrome-mid/30",
  new: "bg-cyan/15 text-cyan border-cyan/30",
  read: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  replied: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  paid: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  awaiting_payment: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
  refunded: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  reviewing: "bg-cyan/15 text-cyan border-cyan/30",
  quoted: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  confirmed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  contacted: "bg-cyan/15 text-cyan border-cyan/30",
  spam: "bg-red-500/15 text-red-400 border-red-500/30",
  in_stock: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  low_stock: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  out_of_stock: "bg-red-500/15 text-red-400 border-red-500/30",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const normalized = status.replace(/_/g, " ");
  const style = statusStyles[status] || "bg-chrome-mid/20 text-chrome-light border-chrome-mid/30";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        style,
        className
      )}
    >
      {normalized}
    </span>
  );
}
