"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { type AddressSelection, type AddressSuggestion } from "@/lib/address-autocomplete";
import { cn } from "@/lib/utils";

const MIN_QUERY_LENGTH = 2;

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (address: AddressSelection) => void;
  cityHint?: string;
  className?: string;
  placeholder?: string;
  id?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  cityHint,
  className,
  placeholder = "Start typing your address…",
  id = "address1",
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [noResults, setNoResults] = useState(false);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const requestIdRef = useRef(0);

  const updateDropdownPosition = useCallback(() => {
    if (!inputRef.current) return;
    setDropdownRect(inputRef.current.getBoundingClientRect());
  }, []);

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

  const fetchSuggestions = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (trimmed.length < MIN_QUERY_LENGTH) {
        setSuggestions([]);
        setOpen(false);
        setNoResults(false);
        setLoading(false);
        return;
      }

      const requestId = ++requestIdRef.current;
      setLoading(true);

      try {
        const params = new URLSearchParams({ q: trimmed });
        if (cityHint?.trim()) params.set("city", cityHint.trim());

        const res = await fetch(`/api/address-search?${params.toString()}`);
        const data = (await res.json()) as AddressSuggestion[];

        if (requestId !== requestIdRef.current) return;

        setSuggestions(data);
        setOpen(data.length > 0);
        setNoResults(data.length === 0);
        setActiveIndex(-1);
        if (data.length > 0) updateDropdownPosition();
      } catch {
        if (requestId !== requestIdRef.current) return;
        setSuggestions([]);
        setOpen(false);
        setNoResults(false);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [cityHint, updateDropdownPosition]
  );

  const scheduleFetch = useCallback(
    (query: string) => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchSuggestions(query), 200);
    },
    [fetchSuggestions]
  );

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  useEffect(() => {
    if (!open) return;

    updateDropdownPosition();
    const handleReposition = () => updateDropdownPosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, suggestions.length, updateDropdownPosition]);

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

  const dropdown =
    showDropdown && dropdownRect
      ? createPortal(
          <ul
            id={`${id}-suggestions`}
            role="listbox"
            style={{
              position: "fixed",
              top: dropdownRect.bottom + 4,
              left: dropdownRect.left,
              width: dropdownRect.width,
              zIndex: 10000,
            }}
            className="max-h-64 overflow-auto rounded-sm border border-cyan/30 bg-[#12141c] py-1 shadow-[0_16px_48px_rgba(0,0,0,0.55)]"
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
          </ul>,
          document.body
        )
      : null;

  return (
    <div className="relative">
      <input
        ref={inputRef}
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
            updateDropdownPosition();
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

      {!loading && value.trim().length >= MIN_QUERY_LENGTH && noResults && (
        <p className="mt-1 text-xs text-chrome-mid">
          No matches found — keep typing or enter your address manually.
        </p>
      )}

      {dropdown}

      <p className="mt-1 text-xs text-chrome-mid">
        Start typing your street address — select a suggestion to auto-fill city, province, and postal code.
      </p>
    </div>
  );
}
