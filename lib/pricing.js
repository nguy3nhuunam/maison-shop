const COMBO_TIERS = [
  { quantity: 1, discount: 0 },
  { quantity: 2, discount: 0.05 },
  { quantity: 3, discount: 0.1 },
];

export function getDiscountedUnitPrice(basePrice, discountPercent = 0) {
  const price = Number(basePrice || 0);
  const percent = Number(discountPercent || 0);
  return Math.max(0, Math.round(price * (1 - percent / 100)));
}

export function getProductSavings(basePrice, discountPercent = 0) {
  const original = Number(basePrice || 0);
  const discounted = getDiscountedUnitPrice(original, discountPercent);
  return Math.max(0, original - discounted);
}

export function getComboTiers(basePrice, discountPercent = 0) {
  const discountedBasePrice = getDiscountedUnitPrice(basePrice, discountPercent);

  return COMBO_TIERS.map((tier) => {
    const rawTotal = discountedBasePrice * tier.quantity;
    const total = Math.round(rawTotal * (1 - tier.discount));
    return {
      ...tier,
      basePrice: discountedBasePrice,
      total,
      savings: rawTotal - total,
      unitPrice: Math.round(total / tier.quantity),
    };
  });
}

export function getLineTotal(basePrice, quantity, discountPercent = 0) {
  const tiers = getComboTiers(basePrice, discountPercent);
  const matchedTier =
    tiers.find((tier) => tier.quantity === quantity) || tiers[tiers.length - 1];

  if (quantity <= 0) {
    return 0;
  }

  if (quantity <= 3) {
    return matchedTier.total;
  }

  const extraQuantity = quantity - 3;
  return tiers[2].total + extraQuantity * tiers[2].basePrice;
}

export function getSubtotal(items = []) {
  return items.reduce(
    (sum, item) =>
      sum + getLineTotal(item.price, Number(item.quantity || 0), Number(item.discountPercent || 0)),
    0,
  );
}

export function getVoucherDiscountAmount(subtotal, voucherPercent = 0) {
  const percent = Number(voucherPercent || 0);
  if (!subtotal || percent <= 0) {
    return 0;
  }

  return Math.round(Number(subtotal) * (percent / 100));
}

export function getOrderPricing(items = [], voucherPercent = 0) {
  const subtotal = getSubtotal(items);
  const voucherDiscount = getVoucherDiscountAmount(subtotal, voucherPercent);
  const total = Math.max(0, subtotal - voucherDiscount);
  const productSavings = items.reduce(
    (sum, item) =>
      sum + getProductSavings(item.price, item.discountPercent) * Number(item.quantity || 0),
    0,
  );

  return {
    subtotal,
    voucherDiscount,
    total,
    productSavings,
  };
}
