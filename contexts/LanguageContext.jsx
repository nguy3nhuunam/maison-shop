"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createTranslator,
  getStoredLanguage,
  setStoredLanguage,
} from "@/lib/translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState("vi");

  useEffect(() => {
    setLanguageState(getStoredLanguage());
  }, []);

  function setLanguage(nextLanguage) {
    const resolvedLanguage = nextLanguage === "zh" ? "zh" : "vi";
    setLanguageState(resolvedLanguage);
    setStoredLanguage(resolvedLanguage);
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: createTranslator(language),
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider.");
  }

  return context;
}
