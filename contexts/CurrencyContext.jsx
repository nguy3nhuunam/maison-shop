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
  const [rate, setRate] = useState(DISPLAY_EXCHANGE_RATE);

  useEffect(() => {
    const storedCurrency = window.localStorage.getItem(CURRENCY_KEY);
    if (storedCurrency) {
      setCurrencyState(getStoredCurrency());
    }

    let active = true;

    async function loadExchangeRate() {
      try {
        const response = await fetch("/api/exchange-rate", {
          method: "GET",
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load exchange rate.");
        }

        if (active) {
          setRate(Number(data?.rate) || DISPLAY_EXCHANGE_RATE);
        }
      } catch {
        if (active) {
          setRate(DISPLAY_EXCHANGE_RATE);
        }
      }
    }

    loadExchangeRate();

    return () => {
      active = false;
    };
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
      rate,
    }),
    [currency, rate],
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
