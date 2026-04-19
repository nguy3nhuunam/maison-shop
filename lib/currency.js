export const CURRENCY_KEY = "maison-currency";
export const DISPLAY_EXCHANGE_RATE = 800;

export function getStoredCurrency() {
  if (typeof window === "undefined") {
    return "TWD";
  }

  return window.localStorage.getItem(CURRENCY_KEY) === "VND" ? "VND" : "TWD";
}

export function setStoredCurrency(currency) {
  if (typeof window === "undefined") {
    return;
  }

  const nextCurrency = currency === "VND" ? "VND" : "TWD";
  window.localStorage.setItem(CURRENCY_KEY, nextCurrency);
}

export function convertPrice(price, currency = "TWD", rate = DISPLAY_EXCHANGE_RATE) {
  const numericPrice = Number(price) || 0;
  return currency === "VND" ? numericPrice * rate : numericPrice;
}

export function formatCurrency(value, currency = "TWD", rate = DISPLAY_EXCHANGE_RATE) {
  const convertedValue = convertPrice(value, currency, rate);

  if (currency === "VND") {
    return `${new Intl.NumberFormat("vi-VN", {
      maximumFractionDigits: 0,
    }).format(convertedValue)}₫`;
  }

  return `NT$${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(convertedValue)}`;
}
