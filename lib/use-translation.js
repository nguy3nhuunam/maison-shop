"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createTranslator,
  getStoredLanguage,
  setStoredLanguage,
} from "@/lib/translations";

export function useTranslation() {
  const [language, setLanguage] = useState("vi");

  useEffect(() => {
    const syncLanguage = (event) => {
      if (event?.detail?.language) {
        setLanguage(event.detail.language === "zh" ? "zh" : "vi");
        return;
      }

      setLanguage(getStoredLanguage());
    };

    syncLanguage();
    window.addEventListener("maison-language-change", syncLanguage);
    window.addEventListener("storage", syncLanguage);

    return () => {
      window.removeEventListener("maison-language-change", syncLanguage);
      window.removeEventListener("storage", syncLanguage);
    };
  }, []);

  const t = useMemo(() => createTranslator(language), [language]);

  return {
    language,
    setLanguage: setStoredLanguage,
    t,
  };
}
