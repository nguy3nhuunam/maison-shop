"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  CURRENCY_KEY,
  DISPLAY_EXCHANGE_RATE,
  getStoredCurrency,
  setStoredCurrency,
} from "@/lib/currency";

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState("TWD");

  useEffect(() => {
    const storedCurrency = window.localStorage.getItem(CURRENCY_KEY);
    if (storedCurrency) {
      setCurrencyState(getStoredCurrency());
    }
  }, []);

  function setCurrency(nextCurrency) {
    const resolvedCurrency = nextCurrency === "VND" ? "VND" : "TWD";
    setCurrencyState(resolvedCurrency);
    setStoredCurrency(resolvedCurrency);
  }

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      rate: DISPLAY_EXCHANGE_RATE,
    }),
    [currency],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider.");
  }

  return context;
}
