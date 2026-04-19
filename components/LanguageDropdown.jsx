"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const LANGUAGE_OPTIONS = [
  { key: "vi", label: "VI" },
  { key: "zh", label: "中文" },
];

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-current" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" strokeWidth="1.6" />
      <path d="M3.5 12h17" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M12 3.5c2.6 2.4 4 5.5 4 8.5s-1.4 6.1-4 8.5c-2.6-2.4-4-5.5-4-8.5s1.4-6.1 4-8.5Z"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LanguageDropdown() {
  const { language, setLanguage } = useLanguage();
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

  const activeLabel = language === "zh" ? "中文" : "VI";

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 items-center gap-1.5 rounded-full border border-stone-200/80 bg-white/85 px-3 text-xs font-medium text-stone-700 shadow-[0_12px_28px_rgba(43,34,24,0.06)] transition hover:border-stone-300 hover:text-stone-900"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <GlobeIcon />
        <span>{activeLabel}</span>
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-40 min-w-[110px] rounded-2xl border border-stone-200 bg-[#fffdf9] p-1.5 shadow-[0_18px_48px_rgba(35,29,22,0.14)]">
          {LANGUAGE_OPTIONS.map((option) => {
            const active = language === option.key;

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => {
                  setLanguage(option.key);
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
