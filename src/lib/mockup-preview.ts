export interface PrintAreaRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const DEFAULT_PRINT_AREA: PrintAreaRect = {
  x: 12,
  y: 18,
  width: 76,
  height: 58,
};

export function getCollageGridLayout(count: number): { cols: number; rows: number } {
  if (count <= 1) return { cols: 1, rows: 1 };
  if (count === 2) return { cols: 2, rows: 1 };
  if (count <= 4) return { cols: 2, rows: 2 };
  if (count <= 6) return { cols: 3, rows: 2 };
  return { cols: 4, rows: 2 };
}
