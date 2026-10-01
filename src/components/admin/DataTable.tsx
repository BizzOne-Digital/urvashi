import Link from "next/link";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyField: keyof T | ((row: T) => string);
  emptyMessage?: string;
  rowHref?: (row: T) => string | undefined;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  emptyMessage = "No records found.",
  rowHref,
}: DataTableProps<T>) {
  const getKey = (row: T, index: number) => {
    if (typeof keyField === "function") return keyField(row);
    return String(row[keyField] ?? index);
  };

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-chrome-light/20 bg-white p-12 text-center text-chrome-mid">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-chrome-light/20 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-chrome-light/20 bg-carbon/5">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn("px-4 py-3 font-semibold text-ink-black", col.className)}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-chrome-light/15">
            {data.map((row, index) => {
              const href = rowHref?.(row);
              const content = (
                <>
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3 text-carbon", col.className)}>
                      {col.render
                        ? col.render(row)
                        : (row[col.key] as React.ReactNode) ?? "—"}
                    </td>
                  ))}
                </>
              );

              if (href) {
                return (
                  <tr key={getKey(row, index)} className="transition-colors hover:bg-royal-blue/5">
                    {columns.map((col, colIndex) => (
                      <td key={col.key} className={cn("px-4 py-3 text-carbon", col.className)}>
                        {colIndex === 0 ? (
                          <Link href={href} className="block font-medium text-ink-black hover:text-royal-blue">
                            {col.render ? col.render(row) : (row[col.key] as React.ReactNode) ?? "—"}
                          </Link>
                        ) : col.render ? (
                          col.render(row)
                        ) : (
                          ((row[col.key] as React.ReactNode) ?? "—")
                        )}
                      </td>
                    ))}
                  </tr>
                );
              }

              return (
                <tr key={getKey(row, index)} className="transition-colors hover:bg-carbon/5">
                  {content}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
