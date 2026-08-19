import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

interface PageActionsProps {
  createHref?: string;
  createLabel?: string;
  children?: React.ReactNode;
}

export function PageActions({ createHref, createLabel = "Create New", children }: PageActionsProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>{children}</div>
      {createHref && (
        <Link href={createHref}>
          <Button>
            <Plus className="h-4 w-4" />
            {createLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}
