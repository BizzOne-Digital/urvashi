"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  parseGooglePlace,
  type AddressSelection,
  type AddressSuggestion,
} from "@/lib/address-autocomplete";
import { cn } from "@/lib/utils";

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

interface GoogleMapsPlacesAutocomplete {
  addListener: (event: string, handler: () => void) => void;
  getPlace: () => {
    address_components?: Array<{ long_name: string; short_name: string; types: string[] }>;
    formatted_address?: string;
  };
}

declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: {
              componentRestrictions?: { country: string[] };
              fields?: string[];
              types?: string[];
            }
          ) => GoogleMapsPlacesAutocomplete;
        };
      };
    };
  }
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (address: AddressSelection) => void;
  className?: string;
  placeholder?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  className,
  placeholder = "Start typing your address…",
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const googleBoundRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const applySelection = useCallback(
    (address: AddressSelection) => {
      onChange(address.address1);
      onAddressSelect(address);
      setOpen(false);
      setSuggestions([]);
      setActiveIndex(-1);
    },
    [onChange, onAddressSelect]
  );

  useEffect(() => {
    if (!GOOGLE_MAPS_KEY || !inputRef.current || googleBoundRef.current) return;

    const bindGoogleAutocomplete = () => {
      if (!inputRef.current || !window.google?.maps?.places) return;

      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: ["ca"] },
        fields: ["address_components", "formatted_address"],
        types: ["address"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        const parsed = parseGooglePlace(place);
        if (parsed.address1) {
          applySelection(parsed);
        }
      });

      googleBoundRef.current = true;
    };

    if (window.google?.maps?.places) {
      bindGoogleAutocomplete();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>("script[data-google-places]");
    if (existing) {
      existing.addEventListener("load", bindGoogleAutocomplete);
      return () => existing.removeEventListener("load", bindGoogleAutocomplete);
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`;
    script.async = true;
    script.dataset.googlePlaces = "true";
    script.onload = bindGoogleAutocomplete;
    document.head.appendChild(script);
  }, [applySelection]);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/address-search?q=${encodeURIComponent(query.trim())}`);
      const data = (await res.json()) as AddressSuggestion[];
      setSuggestions(data);
      setOpen(data.length > 0);
      setActiveIndex(-1);
    } catch {
      setSuggestions([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    onChange(next);

    if (GOOGLE_MAPS_KEY) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(next), 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      applySelection(suggestions[activeIndex].address);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showCustomDropdown = !GOOGLE_MAPS_KEY && open && suggestions.length > 0;

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (!GOOGLE_MAPS_KEY && suggestions.length > 0) setOpen(true);
        }}
        onBlur={() => {
          setTimeout(() => setOpen(false), 150);
        }}
        placeholder={placeholder}
        autoComplete="street-address"
        className={className}
        aria-autocomplete="list"
        aria-expanded={showCustomDropdown}
        aria-controls="address-suggestions"
      />

      {!GOOGLE_MAPS_KEY && loading && (
        <p className="mt-1 text-xs text-chrome-mid">Searching addresses…</p>
      )}

      {showCustomDropdown && (
        <ul
          id="address-suggestions"
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-sm border border-chrome-light/40 bg-[#12141c] py-1 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
        >
          {suggestions.map((item, index) => (
            <li key={item.id} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                className={cn(
                  "w-full px-3 py-2.5 text-left text-sm transition-colors",
                  index === activeIndex
                    ? "bg-cyan/15 text-pure-paper"
                    : "text-chrome-light hover:bg-white/5 hover:text-pure-paper"
                )}
                onMouseDown={(e) => {
                  e.preventDefault();
                  applySelection(item.address);
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-1 text-xs text-chrome-mid">
        {GOOGLE_MAPS_KEY
          ? "Address suggestions appear as you type."
          : "Type at least 3 characters for Canadian address suggestions."}
      </p>
    </div>
  );
}
