"use client";

import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

export default function Providers({ children }) {
  return (
    <LanguageProvider>
      <CurrencyProvider>{children}</CurrencyProvider>
    </LanguageProvider>
  );
}
