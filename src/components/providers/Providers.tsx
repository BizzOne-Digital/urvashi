"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { PageMotionProvider } from "@/components/motion/PageMotionProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PageMotionProvider>
        {children}
      </PageMotionProvider>
      <Toaster position="top-right" richColors closeButton />
    </SessionProvider>
  );
}
