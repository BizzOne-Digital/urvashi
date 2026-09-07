"use client";

import { useEffect, useId, useRef, useState } from "react";
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
  closeCheckout: () => void;
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

  if (getCheckoutConstructor()) return Promise.resolve();

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

function cleanupCheckoutDom(divId: string) {
  const el = document.getElementById(divId);
  if (el) el.innerHTML = "";
  document.body.classList.remove("checkoutHtmlStyleFromiFrame");
  document.documentElement.classList.remove("checkoutHtmlStyleFromiFrame");
}

export function MonerisCheckout({
  ticket,
  mode,
  onComplete,
  onCancel,
  onError,
}: MonerisCheckoutProps) {
  const reactId = useId();
  const divId = `monerisCheckout-${reactId.replace(/:/g, "")}`;
  const checkoutRef = useRef<MonerisCheckoutInstance | null>(null);
  const loadingRef = useRef(true);
  const [loading, setLoading] = useState(true);

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
        if (cancelled) return;

        const CheckoutCtor = getCheckoutConstructor();
        if (!CheckoutCtor) {
          fail("Moneris checkout is unavailable. Check that payment scripts are not blocked.");
          return;
        }

        cleanupCheckoutDom(divId);

        const checkout = new CheckoutCtor();
        checkoutRef.current = checkout;
        checkout.setMode(mode);
        checkout.setCheckoutDiv(divId);

        checkout.setCallback("page_loaded", () => {
          if (!cancelled) setLoadingState(false);
        });

        checkout.setCallback("page_closed", () => {
          if (!cancelled) onCancelRef.current();
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
      checkoutRef.current?.closeCheckout?.();
      checkoutRef.current = null;
      cleanupCheckoutDom(divId);
    };
  }, [ticket, mode, divId]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      {loading && (
        <div
          className="fixed inset-0 z-[2147483646] flex flex-col items-center justify-center gap-4 bg-[#0a0c14]/95"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm text-pure-paper">Loading secure payment…</p>
          <button
            type="button"
            className="rounded-sm border border-white/20 px-4 py-2 text-sm text-chrome-light hover:border-white/40 hover:text-pure-paper"
            onClick={() => onCancelRef.current()}
          >
            Cancel
          </button>
        </div>
      )}
      {/* Moneris injects a fullscreen iframe into this div — no overlay wrapper */}
      <div id={divId} className="fixed inset-0 z-[2147483647]" />
    </>,
    document.body
  );
}
