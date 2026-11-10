"use client";

import dynamic from "next/dynamic";
import { ProductFlipView } from "@/components/customize/ProductFlipView";
import { getProduct360Kind, type Product360ViewProps } from "@/lib/product-360";

// three.js is large, so it only loads when a customer opens the 360 view on drinkware.
const DrinkwareViewer = dynamic(
  () => import("@/components/customize/DrinkwareViewer").then((m) => m.DrinkwareViewer),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto mt-4 flex aspect-square w-full max-w-lg items-center justify-center rounded-xl border border-white/10 bg-[#0a0c14] text-sm text-chrome-mid">
        Loading 3D view…
      </div>
    ),
  }
);

export function Product360Preview(props: Product360ViewProps) {
  const kind = getProduct360Kind(props.slug);
  if (kind === "flat") return <ProductFlipView {...props} />;
  return <DrinkwareViewer key={kind} kind={kind} {...props} />;
}
