"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

interface Tilt3DProps {
  children: React.ReactNode;
  /** Classes for the tilting slab itself (size, rounding, overflow, background, border). */
  className?: string;
  /** Maximum rotation in degrees at the edges. */
  maxTilt?: number;
}

/**
 * Makes a picture feel like a thick physical slab floating above the page: it tilts toward the
 * mouse, the picture inside shifts with parallax, an extruded edge shows its thickness, a light
 * glare follows the cursor and a soft shadow sits beneath it. Touch devices get a slow idle sway
 * instead (CSS), and everything is disabled for prefers-reduced-motion.
 */
export function Tilt3D({ children, className, maxTilt = 14 }: Tilt3DProps) {
  const ref = useRef<HTMLDivElement>(null);

  const set = (name: string, value: string) => ref.current?.style.setProperty(name, value);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - py) * 2 * maxTilt;
    const ry = (px - 0.5) * 2 * maxTilt;

    set("--tilt-rx", `${rx.toFixed(2)}deg`);
    set("--tilt-ry", `${ry.toFixed(2)}deg`);
    set("--tilt-gx", `${(px * 100).toFixed(1)}%`);
    set("--tilt-gy", `${(py * 100).toFixed(1)}%`);
    // picture inside moves against the cursor for parallax depth
    set("--tilt-px", `${((0.5 - px) * 18).toFixed(1)}px`);
    set("--tilt-py", `${((0.5 - py) * 18).toFixed(1)}px`);
    // extruded edge leans away from the viewing angle
    set("--tilt-ex", `${(0.9 - ry * 0.07).toFixed(2)}px`);
    set("--tilt-ey", `${(1.3 + rx * 0.07).toFixed(2)}px`);
  };

  const onPointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") set("--tilt-s", "1.035");
  };

  const reset = () => {
    for (const [name, value] of [
      ["--tilt-rx", "0deg"],
      ["--tilt-ry", "0deg"],
      ["--tilt-px", "0px"],
      ["--tilt-py", "0px"],
      ["--tilt-ex", "0.9px"],
      ["--tilt-ey", "1.3px"],
      ["--tilt-s", "1"],
    ] as const) {
      set(name, value);
    }
  };

  return (
    <div
      className="tilt-3d-scene"
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
    >
      <div ref={ref} className={cn("tilt-3d", className)}>
        <div className="tilt-3d-layer">{children}</div>
        <span className="tilt-3d-glare" aria-hidden />
      </div>
    </div>
  );
}
