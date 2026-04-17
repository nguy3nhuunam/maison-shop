export function formatCurrency(value, currency = "TWD", language = "vi") {
  const locale = language === "zh" ? "zh-TW" : "vi-VN";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}
