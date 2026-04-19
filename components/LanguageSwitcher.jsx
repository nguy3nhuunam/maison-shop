"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const LANGUAGE_OPTIONS = [
  { key: "vi", label: "VI" },
  { key: "zh", label: "中文" },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center rounded-full border border-stone-200/80 bg-white/85 p-1 shadow-[0_12px_28px_rgba(43,34,24,0.06)]">
      {LANGUAGE_OPTIONS.map((option) => {
        const active = language === option.key;

        return (
          <button
            key={option.key}
            type="button"
            onClick={() => setLanguage(option.key)}
            className={`rounded-full px-3 py-2 text-sm transition sm:px-4 ${
              active
                ? "bg-stone-900 font-semibold text-white"
                : "text-stone-600 hover:bg-[#f6efe2] hover:text-stone-900"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
