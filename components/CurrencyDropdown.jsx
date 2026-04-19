"use client";

import { useEffect, useRef, useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";

const CURRENCY_OPTIONS = [
  { key: "TWD", label: "TWD" },
  { key: "VND", label: "VND" },
];

function CurrencyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-current" aria-hidden="true">
      <path
        d="M12 3.5v17M16 7.5c0-1.7-1.8-3-4-3s-4 1.3-4 3 1.5 2.7 4 3 4 1.3 4 3-1.8 3-4 3-4-1.3-4-3"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CurrencyDropdown() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 items-center gap-1.5 rounded-full border border-stone-200/80 bg-white/85 px-3 text-xs font-medium text-stone-700 shadow-[0_12px_28px_rgba(43,34,24,0.06)] transition hover:border-stone-300 hover:text-stone-900"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <CurrencyIcon />
        <span>{currency}</span>
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-40 min-w-[116px] rounded-2xl border border-stone-200 bg-[#fffdf9] p-1.5 shadow-[0_18px_48px_rgba(35,29,22,0.14)]">
          {CURRENCY_OPTIONS.map((option) => {
            const active = currency === option.key;

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => {
                  setCurrency(option.key);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-[14px] px-3 py-2 text-left text-sm transition ${
                  active
                    ? "bg-stone-900 text-white"
                    : "text-stone-700 hover:bg-[#f6efe2] hover:text-stone-900"
                }`}
              >
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
