"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type AddressSelection, type AddressSuggestion } from "@/lib/address-autocomplete";
import { cn } from "@/lib/utils";

const MIN_QUERY_LENGTH = 2;

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (address: AddressSelection) => void;
  className?: string;
  placeholder?: string;
  id?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  className,
  placeholder = "Start typing your address…",
  id = "address1",
}: AddressAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const requestIdRef = useRef(0);

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

  const fetchSuggestions = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);

    try {
      const res = await fetch(`/api/address-search?q=${encodeURIComponent(trimmed)}`);
      const data = (await res.json()) as AddressSuggestion[];

      if (requestId !== requestIdRef.current) return;

      setSuggestions(data);
      setOpen(data.length > 0);
      setActiveIndex(-1);
    } catch {
      if (requestId !== requestIdRef.current) return;
      setSuggestions([]);
      setOpen(false);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const scheduleFetch = useCallback(
    (query: string) => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchSuggestions(query), 280);
    },
    [fetchSuggestions]
  );

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    onChange(next);
    scheduleFetch(next);
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

  const showDropdown = open && suggestions.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (value.trim().length >= MIN_QUERY_LENGTH) {
            scheduleFetch(value);
          } else if (suggestions.length > 0) {
            setOpen(true);
          }
        }}
        onBlur={() => {
          setTimeout(() => setOpen(false), 200);
        }}
        placeholder={placeholder}
        autoComplete="off"
        className={className}
        aria-autocomplete="list"
        aria-expanded={showDropdown}
        aria-controls={`${id}-suggestions`}
        role="combobox"
      />

      {loading && (
        <p className="mt-1 text-xs text-chrome-mid">Searching addresses…</p>
      )}

      {showDropdown && (
        <ul
          id={`${id}-suggestions`}
          ref={listRef}
          role="listbox"
          className="absolute left-0 right-0 top-full z-[200] mt-1 max-h-64 overflow-auto rounded-sm border border-cyan/30 bg-[#12141c] py-1 shadow-[0_16px_48px_rgba(0,0,0,0.55)]"
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
        Type your street address — Canadian suggestions will appear in the dropdown.
      </p>
    </div>
  );
}
