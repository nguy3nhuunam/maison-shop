"use client";

import { useEffect, useMemo, useState } from "react";
import AddressImageInput from "@/components/address-image-input";
import { formatCurrency } from "@/lib/currency";
import {
  getComboTiers,
  getDiscountedUnitPrice,
  getProductSavings,
} from "@/lib/pricing";

function fillTemplate(template, params = {}) {
  return Object.entries(params).reduce(
    (result, [key, value]) =>
      result
        .replaceAll(`{{${key}}}`, String(value))
        .replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function getFirstAvailableVariant(product) {
  return product.variants.find((variant) => variant.stock > 0) || product.variants[0] || null;
}

function getVariantBySelection(product, size, color) {
  return (
    product.variants.find(
      (variant) => variant.size === size && variant.color === color,
    ) || null
  );
}

function getSelectableSizes(product, selectedColor) {
  return [...new Set(product.variants.map((variant) => variant.size))].map((size) => ({
    value: size,
    disabled: !product.variants.some(
      (variant) =>
        variant.size === size &&
        variant.stock > 0 &&
        (!selectedColor || variant.color === selectedColor),
    ),
  }));
}

function getSelectableColors(product, selectedSize) {
  return [...new Set(product.variants.map((variant) => variant.color))].map((color) => ({
    value: color,
    disabled: !product.variants.some(
      (variant) =>
        variant.color === color &&
        variant.stock > 0 &&
        (!selectedSize || variant.size === selectedSize),
    ),
  }));
}

function resolveFomoContent(item, stock) {
  const randomCount = Math.floor(Math.random() * 46) + 5;
  const stockValue = stock > 0 ? stock : Math.floor(Math.random() * 8) + 3;

  return item.content
    .replaceAll("{{count}}", String(randomCount))
    .replaceAll("{{stock}}", String(stockValue));
}

function resolveSelectedImages(product, color, selectedVariant) {
  const productImages = Array.isArray(product?.images) ? product.images.filter(Boolean) : [];
  const colorImages = Array.isArray(product?.variants)
    ? [
        ...new Set(
          product.variants
            .filter((variant) => !color || variant.color === color)
            .flatMap((variant) => (Array.isArray(variant.images) ? variant.images : []))
            .filter(Boolean),
        ),
      ]
    : [];
  const selectedVariantImages = Array.isArray(selectedVariant?.images)
    ? selectedVariant.images.filter(Boolean)
    : [];

  if (colorImages.length > 0) {
    return colorImages;
  }

  if (selectedVariantImages.length > 0) {
    return selectedVariantImages;
  }

  return productImages;
}

function readFilesAsDataUrls(fileList) {
  return Promise.all(
    Array.from(fileList || []).map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = () => reject(new Error("FILE_READ_FAILED"));
          reader.readAsDataURL(file);
        }),
    ),
  );
}

export default function ProductDetailSheet({
  product,
  products,
  fomoItems,
  open,
  currency,
  rate,
  t,
  customerForm,
  onCustomerChange,
  onAddressImageChange,
  onAddressImageRemove,
  onClose,
  onAddToCart,
  onQuickBuy,
  onOpenRelatedProduct,
  buildMessengerHref,
  quickBuyMessage,
  quickBuySubmitting,
}) {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [localMessage, setLocalMessage] = useState("");
  const [fomoIndex, setFomoIndex] = useState(0);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    phone: "",
    rating: 5,
    content: "",
    images: [],
  });
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  useEffect(() => {
    if (!product) {
      return;
    }

    const firstVariant = getFirstAvailableVariant(product);
    setSelectedSize(firstVariant?.size || "");
    setSelectedColor(firstVariant?.color || "");
    setSelectedImageIndex(0);
    setQuantity(firstVariant?.stock > 0 ? 1 : 0);
    setLocalMessage("");
    setFomoIndex(0);
    setReviewMessage("");
    setReviewModalOpen(false);
    setReviewForm({
      name: "",
      phone: "",
      rating: 5,
      content: "",
      images: [],
    });
  }, [product]);

  const selectedVariant = useMemo(
    () => (product ? getVariantBySelection(product, selectedSize, selectedColor) : null),
    [product, selectedColor, selectedSize],
  );
  const sizeOptions = useMemo(
    () => (product ? getSelectableSizes(product, selectedColor) : []),
    [product, selectedColor],
  );
  const colorOptions = useMemo(
    () => (product ? getSelectableColors(product, selectedSize) : []),
    [product, selectedSize],
  );
  const selectedImages = useMemo(
    () => (product ? resolveSelectedImages(product, selectedColor, selectedVariant) : []),
    [product, selectedColor, selectedVariant],
  );
  const activeImage = selectedImages[selectedImageIndex] || selectedImages[0] || product?.image || "";
  const comboTiers = useMemo(
    () => (product ? getComboTiers(product.basePrice, product.discountPercent) : []),
    [product],
  );
  const relatedProducts = useMemo(
    () =>
      product
        ? products
            .filter((item) => item.id !== product.id && item.category === product.category)
            .slice(0, 4)
        : [],
    [product, products],
  );
  const resolvedFomo = useMemo(() => {
    if (!fomoItems.length) {
      return [];
    }

    return fomoItems.map((item) => ({
      ...item,
      content: resolveFomoContent(item, selectedVariant?.stock || product?.totalStock || 0),
    }));
  }, [fomoItems, product?.totalStock, selectedVariant?.stock]);

  useEffect(() => {
    if (resolvedFomo.length <= 1 || !open) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setFomoIndex((current) => (current + 1) % resolvedFomo.length);
    }, 3200);

    return () => window.clearInterval(interval);
  }, [open, resolvedFomo.length]);

  useEffect(() => {
    if (selectedImageIndex < selectedImages.length) {
      return;
    }

    setSelectedImageIndex(0);
  }, [selectedImageIndex, selectedImages]);

  useEffect(() => {
    setReviewForm((current) => ({
      ...current,
      name: current.name || customerForm?.name || "",
      phone: current.phone || customerForm?.phone || "",
    }));
  }, [customerForm?.name, customerForm?.phone]);

  const reviewCopy =
    t.language === "zh"
      ? {
          title: "填寫評價",
          note: "新評價會在管理員審核後顯示。若姓名與電話符合已購買訂單，系統會標記為已驗證買家。",
          name: "姓名",
          phone: "電話",
          rating: "評分",
          content: "評價內容",
          contentPlaceholder: "分享版型、布料、出貨或實拍照片的感受...",
          image: "評價圖片",
          addImage: "新增圖片",
          removeImage: "刪除",
          submit: "送出評價",
          submitting: "送出中...",
          success: "已收到評價，審核後會顯示在商品頁。",
          error: "目前無法送出評價。",
          open: "寫下評價",
          close: "關閉",
          helper: "PNG、JPG、WEBP，最多 4 張。",
          count: "則評價",
          verified: "已驗證",
        }
      : {
          title: "Viết đánh giá",
          note: "Đánh giá mới sẽ hiển thị sau khi admin duyệt. Nếu tên và số điện thoại khớp đơn đã mua, hệ thống sẽ gắn nhãn người mua đã xác thực.",
          name: "Họ và tên",
          phone: "Số điện thoại",
          rating: "Đánh giá",
          content: "Nội dung đánh giá",
          contentPlaceholder: "Chia sẻ cảm nhận về form, chất vải, giao hàng hoặc ảnh thật...",
          image: "Ảnh đánh giá",
          addImage: "Thêm ảnh",
          removeImage: "Xóa",
          submit: "Gửi đánh giá",
          submitting: "Đang gửi...",
          success: "Đã ghi nhận đánh giá. Đánh giá sẽ hiển thị sau khi được duyệt.",
          error: "Không thể gửi đánh giá lúc này.",
          open: "Viết đánh giá",
          close: "Đóng",
          helper: "PNG, JPG, WEBP. Tối đa 4 ảnh.",
          count: "đánh giá",
          verified: "Đã xác thực",
        };

  async function handleReviewImageChange(event) {
    try {
      const nextImages = await readFilesAsDataUrls(event.target.files);
      setReviewForm((current) => ({
        ...current,
        images: [...current.images, ...nextImages].slice(0, 4),
      }));
    } catch {
      setReviewMessage(reviewCopy.error);
    } finally {
      event.target.value = "";
    }
  }

  async function submitReview(event) {
    event.preventDefault();
    setReviewSubmitting(true);
    setReviewMessage("");

    try {
      const response = await fetch(`/api/products/${product.id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewForm),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || reviewCopy.error);
      }

      setReviewForm({
        name: customerForm?.name || reviewForm.name,
        phone: customerForm?.phone || reviewForm.phone,
        rating: 5,
        content: "",
        images: [],
      });
      setReviewModalOpen(false);
      setReviewMessage(reviewCopy.success);
    } catch (error) {
      setReviewMessage(error.message || reviewCopy.error);
    } finally {
      setReviewSubmitting(false);
    }
  }

  if (!product) {
    return null;
  }

  function handleSizeChange(size) {
    const matchingVariant =
      product.variants.find(
        (variant) =>
          variant.size === size &&
          variant.stock > 0 &&
          (!selectedColor || variant.color === selectedColor),
      ) ||
      product.variants.find((variant) => variant.size === size && variant.stock > 0);

    setSelectedSize(size);
    setSelectedColor(matchingVariant?.color || "");
    if ((matchingVariant?.color || "") !== selectedColor) {
      setSelectedImageIndex(0);
    }
    setQuantity(matchingVariant?.stock > 0 ? 1 : 0);
    setLocalMessage("");
  }

  function handleColorChange(color) {
    const matchingVariant =
      product.variants.find(
        (variant) =>
          variant.color === color &&
          variant.stock > 0 &&
          (!selectedSize || variant.size === selectedSize),
      ) ||
      product.variants.find((variant) => variant.color === color && variant.stock > 0);

    setSelectedColor(color);
    setSelectedSize(matchingVariant?.size || "");
    setSelectedImageIndex(0);
    setQuantity(matchingVariant?.stock > 0 ? 1 : 0);
    setLocalMessage("");
  }

  function buildItem() {
    if (!selectedVariant || !selectedSize || !selectedColor) {
      setLocalMessage(t.variantRequired);
      return null;
    }

    if (selectedVariant.stock <= 0) {
      setLocalMessage(t.outOfStock);
      return null;
    }

    return {
      key: `${product.id}-${selectedVariant.id}`,
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      image: activeImage,
      size: selectedVariant.size,
      color: selectedVariant.color,
      quantity,
      price: product.basePrice,
      discountPercent: product.discountPercent,
      isFreeShip: product.isFreeShip,
      stock: selectedVariant.stock,
    };
  }

  const messengerHref = buildMessengerHref(product, selectedVariant);
  const discountedPrice = getDiscountedUnitPrice(product.basePrice, product.discountPercent);
  const unitSavings = getProductSavings(product.basePrice, product.discountPercent);
  const reviewCountLabel =
    t.language === "zh"
      ? `${product.reviews?.length || 0} 則評價`
      : `${product.reviews?.length || 0} ${reviewCopy.count}`;

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-stone-900/45 transition ${open ? "visible opacity-100" : "invisible opacity-0"}`}
        onClick={onClose}
      />

      <div
        className={`fixed inset-0 z-[70] overflow-y-auto bg-[#fffdf9] transition duration-300 ${open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-8 opacity-0"}`}
      >
        <div className="mx-auto min-h-full max-w-7xl px-4 py-5 lg:px-8 lg:py-8">
          <div className="luxury-card fade-rise rounded-[36px] p-5 lg:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[#b38a45]">
                  {t.quickBuyTitle}
                </p>
                <h2 className="mt-2 text-3xl font-bold text-stone-900 lg:text-4xl">
                  {product.name}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-500">
                  {t.quickBuyNote}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-600"
              >
                {t.close}
              </button>
            </div>

            <div className="mt-6 grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
              <div className="space-y-5">
                {activeImage ? (
                  <div className="space-y-3">
                    <div className="overflow-hidden rounded-[28px] bg-[#f2eadf]">
                      <img
                        key={activeImage}
                        src={activeImage}
                        alt={product.name}
                        className="fade-rise aspect-[4/5] w-full object-cover"
                      />
                    </div>

                    {selectedImages.length > 1 ? (
                      <div className="flex gap-3 overflow-x-auto pb-1">
                        {selectedImages.map((image, index) => (
                          <button
                            key={`${image}-${index}`}
                            type="button"
                            onClick={() => setSelectedImageIndex(index)}
                            className={`shrink-0 overflow-hidden rounded-[20px] border transition ${
                              selectedImageIndex === index
                                ? "border-stone-900 shadow-[0_10px_24px_rgba(22,18,13,0.12)]"
                                : "border-stone-200"
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${product.name} ${index + 1}`}
                              className="h-20 w-16 object-cover sm:h-24 sm:w-20"
                            />
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex aspect-[4/5] items-center justify-center rounded-[28px] bg-[#f2eadf] text-sm text-stone-400">
                    {t.productPreviewEmpty}
                  </div>
                )}

                <div className="rounded-[28px] bg-white p-5">
                  <div className="border-b border-stone-100 pb-5">
                    <p className="text-sm font-semibold text-stone-900">{t("productFieldDescription")}</p>
                    <p className="mt-3 text-sm leading-7 text-stone-500">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-stone-500">{t("fromLabel")}</p>
                      {product.discountPercent > 0 ? (
                        <p className="mt-1 text-sm text-stone-400 line-through">
                          {formatCurrency(product.basePrice, currency, rate)}
                        </p>
                      ) : null}
                      <p className="mt-1 text-3xl font-bold text-stone-900">
                        {formatCurrency(discountedPrice, currency, rate)}
                      </p>
                    </div>
                    <div className="text-right text-sm text-stone-500">
                      <p>{fillTemplate(t.variantCountLabel, { count: product.variants.length })}</p>
                      <p className="mt-1">
                        {selectedVariant?.stock > 0
                          ? fillTemplate(t.stockLeft, { count: selectedVariant.stock })
                          : t.outOfStock}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {product.discountPercent > 0 ? (
                      <span className="rounded-full bg-stone-900 px-3 py-1 text-[11px] font-semibold text-white">
                        {t("discountBadge", { percent: product.discountPercent })}
                      </span>
                    ) : null}
                    {product.isFreeShip ? (
                      <span className="rounded-full bg-[#f6efe2] px-3 py-1 text-[11px] font-semibold text-[#b38a45]">
                        {t("freeShipBadge")}
                      </span>
                    ) : null}
                    {unitSavings > 0 ? (
                      <span className="rounded-full border border-stone-200 px-3 py-1 text-[11px] text-stone-600">
                        {t("promotionSavings", {
                          amount: formatCurrency(unitSavings, currency, rate),
                        })}
                      </span>
                    ) : null}
                  </div>

                  {resolvedFomo.length > 0 ? (
                    <div className="soft-pulse mt-4 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-600">
                      <p className="font-semibold">{t.fomoTitle}</p>
                      <p className="mt-1">{resolvedFomo[fomoIndex]?.content}</p>
                    </div>
                  ) : null}

                  <div className="mt-5">
                    <p className="text-sm font-semibold text-stone-900">{t.comboTitle}</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      {comboTiers.map((tier) => (
                        <button
                          key={tier.quantity}
                          type="button"
                          onClick={() => setQuantity(Math.min(tier.quantity, selectedVariant?.stock || tier.quantity))}
                          className={`rounded-2xl border px-4 py-4 text-left transition ${
                            quantity === tier.quantity
                              ? "border-stone-900 bg-stone-900 text-white"
                              : tier.quantity === 3
                                ? "border-[#b38a45] bg-[#fff8ee] text-stone-800"
                                : "border-stone-200 bg-white text-stone-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">{tier.quantity}x</span>
                            {tier.quantity === 3 ? (
                              <span className="rounded-full bg-[#b38a45] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white">
                                {t.comboBest}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-3 text-lg font-bold">
                            {formatCurrency(tier.total, currency, rate)}
                          </p>
                          {tier.savings > 0 ? (
                            <p className="mt-1 text-xs opacity-80">
                              {fillTemplate(t.comboSave, {
                                amount: formatCurrency(tier.savings, currency, rate),
                              })}
                            </p>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  </div>

                  {product.reviews?.length ? (
                    <div className="mt-5 rounded-[24px] bg-[#fcfaf6] p-4">
                      <p className="text-sm font-semibold text-stone-900">{t.reviewsTitle}</p>
                      <div className="mt-3 space-y-3">
                        {product.reviews.slice(0, 3).map((review) => (
                          <div key={review.id} className="rounded-2xl bg-white p-3">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium text-stone-800">{review.name}</span>
                                {review.verifiedBuyer ? (
                                  <span className="rounded-full bg-stone-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                                    {t.language === "zh" ? "已驗證" : reviewCopy.verified}
                                  </span>
                                ) : null}
                              </div>
                              <span className="text-[#b38a45]">{"★".repeat(review.rating || 5)}</span>
                            </div>
                            <p className="mt-2 text-sm text-stone-500">{review.content}</p>
                            {review.images?.length ? (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {review.images.map((image) => (
                                  <a key={image} href={image} target="_blank" rel="noreferrer">
                                    <img
                                      src={image}
                                      alt={review.name}
                                      className="h-16 w-16 rounded-2xl object-cover"
                                    />
                                  </a>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-5 rounded-[24px] bg-white p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-stone-900">{reviewCopy.title}</p>
                        <p className="mt-2 text-sm leading-6 text-stone-500">{reviewCopy.note}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-[#f6efe2] px-3 py-1 text-[11px] font-semibold text-[#b38a45]">
                          {reviewCountLabel}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setReviewMessage("");
                            setReviewModalOpen(true);
                          }}
                          className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b38a45]"
                        >
                          {reviewCopy.open}
                        </button>
                      </div>
                    </div>
                    {reviewMessage ? <p className="mt-4 text-sm text-stone-600">{reviewMessage}</p> : null}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-[28px] bg-white p-5">
                  <p className="text-sm font-semibold text-stone-900">{t.selectOptions}</p>

                  <div className="mt-5">
                    <p className="text-sm font-semibold text-stone-900">{t.selectSize}</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {sizeOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          disabled={option.disabled}
                          onClick={() => handleSizeChange(option.value)}
                          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                            selectedSize === option.value
                              ? "bg-stone-900 text-white"
                              : option.disabled
                                ? "cursor-not-allowed border border-stone-200 bg-stone-100 text-stone-300"
                                : "border border-stone-200 bg-white text-stone-700 hover:border-stone-900"
                          }`}
                        >
                          {option.value}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-sm font-semibold text-stone-900">{t.selectColor}</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {colorOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          disabled={option.disabled}
                          onClick={() => handleColorChange(option.value)}
                          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                            selectedColor === option.value
                              ? "bg-stone-900 text-white"
                              : option.disabled
                                ? "cursor-not-allowed border border-stone-200 bg-stone-100 text-stone-300"
                                : "border border-stone-200 bg-white text-stone-700 hover:border-stone-900"
                          }`}
                        >
                          {option.value}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-end gap-4">
                    <div>
                      <p className="text-sm font-semibold text-stone-900">{t.quantity}</p>
                      <div className="mt-3 flex items-center gap-2 rounded-full border border-stone-200 bg-white px-2 py-1">
                        <button
                          type="button"
                          disabled={!selectedVariant || quantity <= 1}
                          onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                          className="h-9 w-9 rounded-full text-lg text-stone-700 disabled:cursor-not-allowed disabled:text-stone-300"
                        >
                          -
                        </button>
                        <span className="min-w-8 text-center text-sm font-semibold">{quantity}</span>
                        <button
                          type="button"
                          disabled={!selectedVariant || quantity >= (selectedVariant?.stock || 0)}
                          onClick={() =>
                            setQuantity((current) =>
                              Math.min(selectedVariant?.stock || current, current + 1),
                            )
                          }
                          className="h-9 w-9 rounded-full text-lg text-stone-700 disabled:cursor-not-allowed disabled:text-stone-300"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {selectedVariant ? (
                      <div className="rounded-2xl bg-[#f6efe2] px-4 py-3 text-sm text-stone-700">
                        {fillTemplate(t.variantInfo, {
                          size: selectedVariant.size,
                          color: selectedVariant.color,
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>

                <form
                  className="rounded-[28px] bg-white p-5"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    const item = buildItem();
                    if (!item) {
                      return;
                    }
                    const ok = await onQuickBuy(item);
                    if (ok) {
                      onClose();
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-stone-900">{t.customerInfo}</p>
                      <p className="mt-1 text-sm text-stone-500">{t.restoreInfo}</p>
                    </div>
                    <a
                      href={messengerHref}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-[#b38a45] px-4 py-2 text-sm font-medium text-[#b38a45]"
                    >
                      {t.chatForThis}
                    </a>
                  </div>

                  <div className="mt-5 grid gap-4">
                    <label className="block space-y-2 text-sm text-stone-600">
                      <span>{t("customer_name")}</span>
                      <input
                        name="name"
                        required
                        minLength={2}
                        placeholder={t("customer_name_placeholder")}
                        value={customerForm.name}
                        onChange={(event) => onCustomerChange("name", event.target.value)}
                        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
                      />
                    </label>
                    <label className="block space-y-2 text-sm text-stone-600">
                      <span>{t.phone}</span>
                      <input
                        required
                        value={customerForm.phone}
                        onChange={(event) => onCustomerChange("phone", event.target.value)}
                        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
                      />
                    </label>
                    <label className="block space-y-2 text-sm text-stone-600">
                      <span>{t.address}</span>
                      <textarea
                        rows={4}
                        value={customerForm.addressText}
                        onChange={(event) => onCustomerChange("addressText", event.target.value)}
                        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
                      />
                    </label>
                    <AddressImageInput
                      label={t.addressImageLabel}
                      uploadTitle={t.addressImageUploadTitle}
                      uploadHelper={t.addressImageUploadHelper}
                      uploadedStatus={t.addressImageUploaded}
                      replaceLabel={t.addressImageReplace}
                      removeLabel={t.addressImageRemove}
                      previewUrl={customerForm.addressImage}
                      fileName={customerForm.addressImageName}
                      onFileChange={onAddressImageChange}
                      onRemove={onAddressImageRemove}
                    />
                  </div>

                  {localMessage || quickBuyMessage ? (
                    <p className="mt-4 text-sm text-red-500">{localMessage || quickBuyMessage}</p>
                  ) : null}

                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => {
                        const item = buildItem();
                        if (!item) {
                          return;
                        }
                        onAddToCart(item);
                        onClose();
                      }}
                      className="rounded-full border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-[#b38a45] hover:text-[#b38a45]"
                    >
                      {t.addToCart}
                    </button>
                    <button
                      type="submit"
                      disabled={quickBuySubmitting}
                      className="rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#b38a45] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {quickBuySubmitting ? t("submitting") : t("submitOrder")}
                    </button>
                  </div>
                </form>

                {relatedProducts.length > 0 ? (
                  <div className="rounded-[28px] bg-white p-5">
                    <p className="text-sm font-semibold text-stone-900">{t.relatedProducts}</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {relatedProducts.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onOpenRelatedProduct(item.id)}
                          className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-[#fcfaf6] p-3 text-left"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-20 w-16 rounded-2xl object-cover"
                          />
                          <div>
                            <p className="font-medium text-stone-900">{item.name}</p>
                            <p className="mt-1 text-sm text-stone-500">
                              {formatCurrency(
                                getDiscountedUnitPrice(item.basePrice, item.discountPercent),
                                currency,
                                rate,
                              )}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {reviewModalOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-stone-900/50 px-4 py-8">
          <div
            className="absolute inset-0"
            onClick={() => {
              if (!reviewSubmitting) {
                setReviewModalOpen(false);
              }
            }}
          />
          <form
            onSubmit={submitReview}
            className="relative z-[91] max-h-full w-full max-w-2xl overflow-y-auto rounded-[32px] bg-[#fffdf9] p-6 shadow-[0_25px_80px_rgba(24,18,12,0.22)] sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[#b38a45]">{product.name}</p>
                <h3 className="mt-2 text-2xl font-bold text-stone-900">{reviewCopy.title}</h3>
                <p className="mt-3 text-sm leading-7 text-stone-500">{reviewCopy.note}</p>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-600"
              >
                {reviewCopy.close}
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-stone-600">
                <span>{reviewCopy.name}</span>
                <input
                  required
                  value={reviewForm.name}
                  onChange={(event) =>
                    setReviewForm((current) => ({ ...current, name: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
                />
              </label>

              <label className="space-y-2 text-sm text-stone-600">
                <span>{reviewCopy.phone}</span>
                <input
                  required
                  value={reviewForm.phone}
                  onChange={(event) =>
                    setReviewForm((current) => ({ ...current, phone: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[160px_1fr]">
              <label className="space-y-2 text-sm text-stone-600">
                <span>{reviewCopy.rating}</span>
                <select
                  value={reviewForm.rating}
                  onChange={(event) =>
                    setReviewForm((current) => ({
                      ...current,
                      rating: Number(event.target.value),
                    }))
                  }
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} / 5
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm text-stone-600">
                <span>{reviewCopy.content}</span>
                <textarea
                  required
                  rows={5}
                  value={reviewForm.content}
                  placeholder={reviewCopy.contentPlaceholder}
                  onChange={(event) =>
                    setReviewForm((current) => ({ ...current, content: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
                />
              </label>
            </div>

            <div className="mt-4 rounded-[22px] border border-dashed border-stone-300 bg-[#fcfaf6] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-stone-900">{reviewCopy.image}</p>
                  <p className="mt-1 text-xs text-stone-400">{reviewCopy.helper}</p>
                </div>
                <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700">
                  <span>{reviewCopy.addImage}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleReviewImageChange}
                  />
                </label>
              </div>

              {reviewForm.images.length ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  {reviewForm.images.map((image, index) => (
                    <div key={`${image}-${index}`} className="rounded-2xl bg-white p-2">
                      <img
                        src={image}
                        alt={`review-${index + 1}`}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setReviewForm((current) => ({
                            ...current,
                            images: current.images.filter((_, imageIndex) => imageIndex !== index),
                          }))
                        }
                        className="mt-2 w-full rounded-full border border-red-200 px-3 py-1.5 text-xs text-red-500"
                      >
                        {reviewCopy.removeImage}
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {reviewMessage ? <p className="mt-4 text-sm text-stone-600">{reviewMessage}</p> : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b38a45] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {reviewSubmitting ? reviewCopy.submitting : reviewCopy.submit}
              </button>
              <button
                type="button"
                disabled={reviewSubmitting}
                onClick={() => setReviewModalOpen(false)}
                className="rounded-full border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {reviewCopy.close}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
