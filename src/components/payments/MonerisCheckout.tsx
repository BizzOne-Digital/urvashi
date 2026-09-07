"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type MonerisEnvironment = "qa" | "prod";

const MONERIS_SCRIPT_URLS: Record<MonerisEnvironment, string> = {
  qa: "https://gatewayt.moneris.com/chkt/js/chkt_v1.00.js",
  prod: "https://gateway.moneris.com/chkt/js/chkt_v1.00.js",
};

const LOAD_TIMEOUT_MS = 25_000;

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

type MonerisCheckoutConstructor = new () => MonerisCheckoutInstance;

declare global {
  interface Window {
    monerisCheckout?: MonerisCheckoutConstructor;
  }
}

const scriptPromises: Partial<Record<MonerisEnvironment, Promise<void>>> = {};

function getCheckoutConstructor(): MonerisCheckoutConstructor | undefined {
  if (typeof window === "undefined") return undefined;
  return window.monerisCheckout;
}

function loadMonerisScript(mode: MonerisEnvironment): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  const existing = getCheckoutConstructor();
  if (existing) return Promise.resolve();

  if (!scriptPromises[mode]) {
    scriptPromises[mode] = new Promise((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(
        `script[src="${MONERIS_SCRIPT_URLS[mode]}"]`
      );
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), { once: true });
        existingScript.addEventListener(
          "error",
          () => reject(new Error("Failed to load Moneris checkout")),
          { once: true }
        );
        if (getCheckoutConstructor()) resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = MONERIS_SCRIPT_URLS[mode];
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Moneris checkout"));
      document.body.appendChild(script);
    });
  }

  return scriptPromises[mode]!;
}

export function MonerisCheckout({
  ticket,
  mode,
  onComplete,
  onCancel,
  onError,
}: MonerisCheckoutProps) {
  const startedRef = useRef(false);
  const loadingRef = useRef(true);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const setLoadingState = (value: boolean) => {
    loadingRef.current = value;
    setLoading(value);
  };

  const onCompleteRef = useRef(onComplete);
  const onCancelRef = useRef(onCancel);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onCancelRef.current = onCancel;
    onErrorRef.current = onError;
  }, [onCancel, onComplete, onError]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const fail = (message: string) => {
      setLoadingState(false);
      onErrorRef.current(message);
    };

    async function start() {
      timeoutId = setTimeout(() => {
        if (!cancelled && loadingRef.current) {
          fail("Payment form timed out. Please try again or contact us.");
        }
      }, LOAD_TIMEOUT_MS);

      try {
        await loadMonerisScript(mode);
        if (cancelled || startedRef.current) return;

        const CheckoutCtor = getCheckoutConstructor();
        if (!CheckoutCtor) {
          fail("Moneris checkout is unavailable. Check that payment scripts are not blocked.");
          return;
        }

        const checkout = new CheckoutCtor();
        checkout.setMode(mode);
        checkout.setCheckoutDiv("monerisCheckout");

        checkout.setCallback("page_loaded", () => {
          if (!cancelled) setLoadingState(false);
        });

        checkout.setCallback("cancel_transaction", () => {
          onCancelRef.current();
        });

        checkout.setCallback("error_event", (raw) => {
          try {
            const parsed = JSON.parse(raw) as { error_message?: string };
            fail(parsed.error_message || "Payment error");
          } catch {
            fail("Payment error");
          }
        });

        checkout.setCallback("payment_complete", (raw) => {
          try {
            const parsed = JSON.parse(raw) as { ticket?: string };
            onCompleteRef.current(parsed.ticket || ticket);
          } catch {
            onCompleteRef.current(ticket);
          }
        });

        startedRef.current = true;
        checkout.startCheckout(ticket);
      } catch (err) {
        if (!cancelled) {
          fail(err instanceof Error ? err.message : "Could not load payment form");
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [ticket, mode]);

  const overlay = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-3xl">
        {loading && (
          <p className="mb-4 text-center text-sm text-chrome-light">Loading secure payment…</p>
        )}
        <div id="monerisCheckout" className="min-h-[420px] w-full" />
      </div>
    </div>
  );

  if (!mounted) return overlay;
  return createPortal(overlay, document.body);
}
