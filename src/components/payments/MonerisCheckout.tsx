"use client";

import { useEffect, useRef, useState } from "react";

export type MonerisEnvironment = "qa" | "prod";

const MONERIS_SCRIPT_URLS: Record<MonerisEnvironment, string> = {
  qa: "https://gatewayt.moneris.com/chkt/js/chkt_v1.00.js",
  prod: "https://gateway.moneris.com/chkt/js/chkt_v1.00.js",
};

interface MonerisCheckoutProps {
  ticket: string;
  mode: MonerisEnvironment;
  onComplete: (ticket: string) => void;
  onCancel: () => void;
  onError: (message: string) => void;
}

interface MonerisCheckoutInstance {
  setMode: (mode: MonerisEnvironment) => void;
  setCheckoutDiv: (id: string) => void;
  setCallback: (event: string, callback: (data: string) => void) => void;
  startCheckout: (ticket: string) => void;
}

declare global {
  interface Window {
    monerisCheckout?: new () => MonerisCheckoutInstance;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadMonerisScript(mode: MonerisEnvironment): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.monerisCheckout) return Promise.resolve();

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = MONERIS_SCRIPT_URLS[mode];
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Moneris checkout"));
      document.body.appendChild(script);
    });
  }

  return scriptPromise;
}

export function MonerisCheckout({
  ticket,
  mode,
  onComplete,
  onCancel,
  onError,
}: MonerisCheckoutProps) {
  const startedRef = useRef(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        await loadMonerisScript(mode);
        if (cancelled || startedRef.current) return;

        const CheckoutCtor = window.monerisCheckout;
        if (!CheckoutCtor) {
          onError("Moneris checkout is unavailable");
          return;
        }

        const checkout = new CheckoutCtor();
        checkout.setMode(mode);
        checkout.setCheckoutDiv("monerisCheckout");

        checkout.setCallback("cancel_transaction", () => {
          onCancel();
        });

        checkout.setCallback("error_event", (raw) => {
          try {
            const parsed = JSON.parse(raw) as { error_message?: string };
            onError(parsed.error_message || "Payment error");
          } catch {
            onError("Payment error");
          }
        });

        checkout.setCallback("payment_complete", (raw) => {
          try {
            const parsed = JSON.parse(raw) as { ticket?: string };
            onComplete(parsed.ticket || ticket);
          } catch {
            onComplete(ticket);
          }
        });

        startedRef.current = true;
        setLoading(false);
        checkout.startCheckout(ticket);
      } catch (err) {
        onError(err instanceof Error ? err.message : "Could not load payment form");
      }
    }

    start();

    return () => {
      cancelled = true;
    };
  }, [ticket, mode, onCancel, onComplete, onError]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-3xl rounded-lg bg-[#050508] p-4 shadow-xl">
        {loading && (
          <p className="mb-4 text-center text-sm text-chrome-light">Loading secure payment…</p>
        )}
        <div id="monerisCheckout" className="min-h-[420px] w-full" />
      </div>
    </div>
  );
}
