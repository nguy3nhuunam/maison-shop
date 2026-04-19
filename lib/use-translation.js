"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export function useTranslation() {
  return useLanguage();
}
