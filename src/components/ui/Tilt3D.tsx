"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

interface Tilt3DProps {
  children: React.ReactNode;
  /** Classes for the tilting element itself (size, rounding, overflow, background). */
  className?: string;
  /** Maximum rotation in degrees at the edges. */
  maxTilt?: number;
}

/**
 * Mouse-follow 3D tilt with a moving glare. Only reacts to a real mouse (touch just
 * shows the static depth styling) and is disabled for prefers-reduced-motion in CSS.
 */
export function Tilt3D({ children, className, maxTilt = 9 }: Tilt3DProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    el.style.setProperty("--tilt-rx", `${((0.5 - py) * 2 * maxTilt).toFixed(2)}deg`);
    el.style.setProperty("--tilt-ry", `${((px - 0.5) * 2 * maxTilt).toFixed(2)}deg`);
    el.style.setProperty("--tilt-gx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--tilt-gy", `${(py * 100).toFixed(1)}%`);
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-rx", "0deg");
    el.style.setProperty("--tilt-ry", "0deg");
  };

  return (
    <div className="tilt-3d-scene" onPointerMove={onPointerMove} onPointerLeave={reset}>
      <div ref={ref} className={cn("tilt-3d", className)}>
        {children}
        <span className="tilt-3d-glare" aria-hidden />
      </div>
    </div>
  );
}
