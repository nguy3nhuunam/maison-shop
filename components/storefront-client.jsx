"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AddressImageInput from "@/components/address-image-input";
import ProductList from "@/components/product-list";
import ProductDetailSheet from "@/components/product-detail-sheet";
import TagList from "@/components/tag-list";
import { formatCurrency } from "@/lib/currency";
import {
  getDiscountedUnitPrice,
  getLineTotal,
  getOrderPricing,
} from "@/lib/pricing";
import { getTranslation, setStoredLanguage } from "@/lib/translations";

const LANGUAGE_KEY = "maison-language";
const CART_KEY = "maison-cart";
const CUSTOMER_KEY = "maison-customer";
const VIEWED_KEY = "maison-viewed-products";
const HERO_SLOGAN_KEY = "maison-hero-slogan";
const HERO_SUBTEXT_KEY = "maison-hero-subtext";
const VOUCHER_KEY = "maison-voucher";
const BRAND_LOGO_SRC = "/brand/maison-logo.png";
const EMPTY_CUSTOMER_FORM = {
  name: "",
  phone: "",
  addressText: "",
  addressImage: "",
  addressImageName: "",
};
const HERO_TITLE_KEYS = Array.from({ length: 15 }, (_, index) => `heroTitle${index + 1}`);
const HERO_SUBTEXT_KEYS = Array.from({ length: 10 }, (_, index) => `heroSubtext${index + 1}`);
const HERO_SLOGANS = [
  "Tinh giản trong thiết kế – Nổi bật trong phong cách",
  "Đơn giản khi mặc – Nổi bật khi nhìn",
  "Thanh lịch tối giản – Cuốn hút tự nhiên",
  "Mặc đẹp mỗi ngày – Tỏa sáng mọi nơi",
  "Chọn đúng phong cách – Nâng tầm thần thái",
  "Tinh tế trong từng chi tiết – Khác biệt trong từng ánh nhìn",
  "Thiết kế tinh giản – Đẳng cấp vượt thời gian",
  "Mặc là hợp – Nhìn là mê",
  "Đơn giản nhưng không đơn điệu – Thanh lịch nhưng đầy cuốn hút",
  "Phong cách bắt đầu từ sự tinh giản",
  "Mặc vào là đẹp – Diện lên là nổi",
  "Tinh giản để khác biệt – Thanh lịch để tỏa sáng",
  "Phong cách riêng – Dấu ấn riêng",
  "Không cầu kỳ – Vẫn nổi bật",
  "Chọn đơn giản – Mặc khác biệt",
];

const HERO_SUBTEXTS = {
  vi: [
    "Tinh giản trong thiết kế – Tinh tế trong phong cách.",
    "Đơn giản nhưng không đơn điệu.",
    "Phong cách bắt đầu từ sự tinh giản.",
    "Thanh lịch trong từng lựa chọn.",
    "Dễ mặc, dễ phối, luôn nổi bật.",
    "Tối giản để khác biệt.",
    "Mỗi outfit là một dấu ấn riêng.",
    "Chọn đơn giản – Mặc khác biệt.",
    "Tinh tế trong từng chi tiết nhỏ.",
    "Không cầu kỳ – Vẫn cuốn hút.",
  ],
  zh: [
    "設計極簡，風格更顯細膩。",
    "簡約，但絕不單調。",
    "風格，從精簡開始。",
    "每一次選擇，都帶著優雅。",
    "好穿又好搭，始終亮眼。",
    "用極簡穿出差異。",
    "每一套穿搭，都是自己的印記。",
    "選擇簡單，穿出不同。",
    "細膩感，藏在每個小細節。",
    "不繁複，依然很迷人。",
  ],
};

const HERO_TITLES = {
  vi: [
    "Tinh giản trong thiết kế – Nổi bật trong phong cách",
    "Đơn giản khi mặc – Nổi bật khi nhìn",
    "Thanh lịch tối giản – Cuốn hút tự nhiên",
    "Mặc đẹp mỗi ngày – Tỏa sáng mọi nơi",
    "Chọn đúng phong cách – Nâng tầm thần thái",
    "Tinh tế trong từng chi tiết – Khác biệt trong từng ánh nhìn",
    "Thiết kế tinh giản – Đẳng cấp vượt thời gian",
    "Mặc là hợp – Nhìn là mê",
    "Đơn giản nhưng không đơn điệu – Thanh lịch nhưng đầy cuốn hút",
    "Phong cách bắt đầu từ sự tinh giản",
    "Mặc vào là đẹp – Diện lên là nổi",
    "Tinh giản để khác biệt – Thanh lịch để tỏa sáng",
    "Phong cách riêng – Dấu ấn riêng",
    "Không cầu kỳ – Vẫn nổi bật",
    "Chọn đơn giản – Mặc khác biệt",
  ],
  zh: [
    "設計極簡，風格格外出眾",
    "穿搭簡約，視覺更亮眼",
    "極簡優雅，自然更迷人",
    "每天都好穿，走到哪都出彩",
    "選對風格，氣場立刻升級",
    "細節更講究，回頭率更明顯",
    "極簡設計，質感歷久彌新",
    "一穿就合適，一看就喜歡",
    "簡單不單調，優雅更有吸引力",
    "風格從精簡開始",
    "穿上就好看，立刻更出眾",
    "以極簡突顯差異，以優雅放大光彩",
    "專屬風格，專屬印象",
    "不繁複，也能很亮眼",
    "選擇簡單，穿出不同",
  ],
};

const HERO_DESCRIPTIONS = {
  vi: [
    "Tinh giản trong thiết kế – Tinh tế trong phong cách.",
    "Đơn giản nhưng không đơn điệu.",
    "Phong cách bắt đầu từ sự tinh giản.",
    "Thanh lịch trong từng lựa chọn.",
    "Dễ mặc, dễ phối, luôn nổi bật.",
    "Tối giản để khác biệt.",
    "Mỗi outfit là một dấu ấn riêng.",
    "Chọn đơn giản – Mặc khác biệt.",
    "Tinh tế trong từng chi tiết nhỏ.",
    "Không cầu kỳ – Vẫn cuốn hút.",
  ],
  zh: [
    "設計極簡，風格更顯細膩。",
    "簡約，但絕不單調。",
    "風格，從精簡開始。",
    "每一次選擇，都帶著優雅。",
    "好穿又好搭，始終亮眼。",
    "用極簡穿出差異。",
    "每一套穿搭，都是自己的印記。",
    "選擇簡單，穿出不同。",
    "細膩感，藏在每個小細節。",
    "不繁複，依然很迷人。",
  ],
};

function getSessionMessage(storageKey, language, messagesByLanguage) {
  const activeMessages = messagesByLanguage[language] || messagesByLanguage.vi;
  const scopedKey = `${storageKey}-${language}`;
  const savedMessage = window.sessionStorage.getItem(scopedKey);

  if (savedMessage && activeMessages.includes(savedMessage)) {
    return savedMessage;
  }

  const nextMessage = activeMessages[Math.floor(Math.random() * activeMessages.length)];
  window.sessionStorage.setItem(scopedKey, nextMessage);
  return nextMessage;
}

function isValidCartItem(item) {
  return (
    item &&
    Number.isInteger(Number(item.productId)) &&
    Number.isInteger(Number(item.variantId)) &&
    typeof item.key === "string" &&
    Number.isInteger(Number(item.quantity)) &&
    Number.isFinite(Number(item.price))
  );
}

function fillTemplate(template, params = {}) {
  return Object.entries(params).reduce(
    (result, [key, value]) =>
      result
        .replaceAll(`{{${key}}}`, String(value))
        .replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function mergeCartItem(cart, nextItem) {
  const existing = cart.find((item) => item.variantId === nextItem.variantId);

  if (!existing) {
    const quantity = Math.min(nextItem.quantity, nextItem.stock);
    return {
      items: [...cart, { ...nextItem, quantity }],
      capped: quantity !== nextItem.quantity,
    };
  }

  const nextQuantity = Math.min(existing.quantity + nextItem.quantity, existing.stock);

  return {
    items: cart.map((item) =>
      item.variantId === nextItem.variantId ? { ...item, quantity: nextQuantity } : item,
    ),
    capped: nextQuantity !== existing.quantity + nextItem.quantity,
  };
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 stroke-current">
      <path
        d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 7H7"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="19" r="1.2" />
      <circle cx="17" cy="19" r="1.2" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden="true">
      <path d="M13.5 21v-7.2h2.4l.4-2.8h-2.8V9.2c0-.8.2-1.4 1.4-1.4H16V5.3c-.3 0-.9-.1-1.8-.1-1.8 0-3.1 1.1-3.1 3.2V11H8.8v2.8h2.3V21h2.4Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px] stroke-current" aria-hidden="true">
      <rect x="3.75" y="3.75" width="16.5" height="16.5" rx="4.5" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="3.75" strokeWidth="1.7" />
      <circle cx="17.1" cy="6.9" r="1.05" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden="true">
      <path d="M9 3v12.5a3.5 3.5 0 1 1-3.5-3.5c.2 0 .4 0 .5.1V9.5a6.5 6.5 0 1 0 6.5 6.5V7.9c1.3 1 2.8 1.6 4.5 1.6V6.5c-1.2 0-2.3-.4-3.2-1.2A4.5 4.5 0 0 1 12 3H9z" />
    </svg>
  );
}

function normalizeExternalUrl(value) {
  const rawValue = String(value || "").trim();
  if (!rawValue) {
    return "";
  }

  return rawValue.startsWith("http://") || rawValue.startsWith("https://")
    ? rawValue
    : `https://${rawValue}`;
}

export default function StorefrontClient({
  products,
  settings,
  fomoItems,
  tags = [],
  activeTagSlug = "all",
}) {
  const [catalog, setCatalog] = useState(products);
  const [language, setLanguage] = useState("vi");
  const [heroSlogan, setHeroSlogan] = useState("");
  const [heroSubtext, setHeroSubtext] = useState("");
  const [heroReady, setHeroReady] = useState(false);
  const [logoVisible, setLogoVisible] = useState(true);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const [quickBuyMessage, setQuickBuyMessage] = useState("");
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [orderSuccessOpen, setOrderSuccessOpen] = useState(false);
  const [voucherInput, setVoucherInput] = useState("");
  const [voucher, setVoucher] = useState(null);
  const [voucherMessage, setVoucherMessage] = useState("");
  const [applyingVoucher, setApplyingVoucher] = useState(false);
  const [customerForm, setCustomerForm] = useState(EMPTY_CUSTOMER_FORM);
  const [viewedIds, setViewedIds] = useState([]);

  useEffect(() => {
    setCatalog(products);
  }, [products]);

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(LANGUAGE_KEY);
    const savedCart = window.localStorage.getItem(CART_KEY);
    const savedCustomer = window.localStorage.getItem(CUSTOMER_KEY);
    const savedViewed = window.localStorage.getItem(VIEWED_KEY);
    const savedVoucher = window.localStorage.getItem(VOUCHER_KEY);
    const initialLanguage = savedLanguage === "zh" ? "zh" : "vi";

    if (savedLanguage === "zh") {
      setLanguage("zh");
    }

    try {
      const savedTitleKey = window.sessionStorage.getItem(HERO_SLOGAN_KEY);
      const nextTitleKey = HERO_TITLE_KEYS.includes(savedTitleKey)
        ? savedTitleKey
        : HERO_TITLE_KEYS[Math.floor(Math.random() * HERO_TITLE_KEYS.length)];
      window.sessionStorage.setItem(HERO_SLOGAN_KEY, nextTitleKey);
      setHeroSlogan(nextTitleKey);

      const savedSubtextKey = window.sessionStorage.getItem(HERO_SUBTEXT_KEY);
      const nextSubtextKey = HERO_SUBTEXT_KEYS.includes(savedSubtextKey)
        ? savedSubtextKey
        : HERO_SUBTEXT_KEYS[Math.floor(Math.random() * HERO_SUBTEXT_KEYS.length)];
      window.sessionStorage.setItem(HERO_SUBTEXT_KEY, nextSubtextKey);
      setHeroSubtext(nextSubtextKey);
    } catch {
      setHeroSlogan(getSessionMessage(HERO_SLOGAN_KEY, "vi", { vi: HERO_TITLE_KEYS }));
      setHeroSubtext(getSessionMessage(HERO_SUBTEXT_KEY, "vi", { vi: HERO_SUBTEXT_KEYS }));
    } finally {
      setHeroReady(true);
    }

    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        const validItems = Array.isArray(parsed) ? parsed.filter(isValidCartItem) : [];
        setCart(validItems);
        if (validItems.length !== (Array.isArray(parsed) ? parsed.length : 0)) {
          window.localStorage.setItem(CART_KEY, JSON.stringify(validItems));
        }
      } catch {
        window.localStorage.removeItem(CART_KEY);
      }
    }

    if (savedCustomer) {
      try {
        const parsed = JSON.parse(savedCustomer);
        setCustomerForm({
          name: parsed.name || "",
          phone: parsed.phone || "",
          addressText: parsed.addressText || parsed.address || "",
          addressImage: "",
          addressImageName: "",
        });
      } catch {
        window.localStorage.removeItem(CUSTOMER_KEY);
      }
    }

    if (savedViewed) {
      try {
        const parsed = JSON.parse(savedViewed);
        setViewedIds(Array.isArray(parsed) ? parsed.map(Number).filter(Boolean) : []);
      } catch {
        window.localStorage.removeItem(VIEWED_KEY);
      }
    }

    if (savedVoucher) {
      try {
        const parsed = JSON.parse(savedVoucher);
        setVoucher(parsed);
        setVoucherInput(parsed.code || "");
      } catch {
        window.localStorage.removeItem(VOUCHER_KEY);
      }
    }
  }, []);

  useEffect(() => {
    setStoredLanguage(language);
  }, [language]);

  useEffect(() => {
    try {
      const savedTitleKey = window.sessionStorage.getItem(HERO_SLOGAN_KEY);
      setHeroSlogan(HERO_TITLE_KEYS.includes(savedTitleKey) ? savedTitleKey : HERO_TITLE_KEYS[0]);
      const savedSubtextKey = window.sessionStorage.getItem(HERO_SUBTEXT_KEY);
      setHeroSubtext(
        HERO_SUBTEXT_KEYS.includes(savedSubtextKey) ? savedSubtextKey : HERO_SUBTEXT_KEYS[0],
      );
    } catch {
      setHeroSlogan(getSessionMessage(HERO_SLOGAN_KEY, language, { [language]: HERO_TITLE_KEYS }));
      setHeroSubtext(
        getSessionMessage(HERO_SUBTEXT_KEY, language, { [language]: HERO_SUBTEXT_KEYS }),
      );
    }
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    window.localStorage.setItem(
      CUSTOMER_KEY,
      JSON.stringify({
        name: customerForm.name,
        phone: customerForm.phone,
        addressText: customerForm.addressText,
      }),
    );
  }, [customerForm.addressText, customerForm.name, customerForm.phone]);

  useEffect(() => {
    window.localStorage.setItem(VIEWED_KEY, JSON.stringify(viewedIds));
  }, [viewedIds]);

  useEffect(() => {
    if (!voucher) {
      window.localStorage.removeItem(VOUCHER_KEY);
      return;
    }

    window.localStorage.setItem(VOUCHER_KEY, JSON.stringify(voucher));
  }, [voucher]);

  const t = getTranslation(language);
  const currency = settings?.currency || "TWD";
  const activeHeroTitle =
    t(heroSlogan || HERO_TITLE_KEYS[0]) || HERO_TITLES.vi[0] || HERO_SLOGANS[0];
  const activeHeroSubtext =
    t(heroSubtext || HERO_SUBTEXT_KEYS[0]) ||
    HERO_DESCRIPTIONS.vi[0] ||
    HERO_SUBTEXTS.vi[0];
  const selectedProduct = useMemo(
    () => catalog.find((product) => product.id === selectedProductId) || null,
    [catalog, selectedProductId],
  );
  const recentlyViewedProducts = useMemo(
    () =>
      viewedIds
        .map((id) => catalog.find((product) => product.id === id))
        .filter(Boolean)
        .slice(0, 4),
    [catalog, viewedIds],
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const pricing = getOrderPricing(cart, voucher?.discountPercent || 0);
  const total = pricing.total;
  const activeTag = useMemo(
    () => tags.find((tag) => tag.slug === activeTagSlug) || null,
    [activeTagSlug, tags],
  );
  const filteredProducts = useMemo(
    () =>
      activeTagSlug === "all"
        ? catalog
        : catalog.filter((product) => Array.isArray(product.tags) && product.tags.includes(activeTagSlug)),
    [activeTagSlug, catalog],
  );
  const footerContent =
    language === "zh"
      ? {
          brandTitle: "MAISON",
          brandDescription:
            "Tinh giản trong thiết kế, tinh tế trong trải nghiệm – dành cho phong cách sống hiện đại.",
          brandDescriptionEn: "Refined minimalism, crafted for modern living.",
          productTitle: "商品",
          productItems: ["男裝", "女裝", "上衣", "褲裝", "洋裝", "內著", "Sale"],
          supportTitle: "支援",
          supportItems: ["購物指南", "退換貨", "配送資訊", "FAQ"],
          contactTitle: "聯絡我們",
          contactDescription: "透過社群平台與 MAISON 保持聯繫",
          copyright: "© 2026 MAISON SHOP",
          designedBy: "Designed by MrNine",
        }
      : {
          brandTitle: "MAISON",
          brandDescription:
            "Tinh giản trong thiết kế, tinh tế trong trải nghiệm – dành cho phong cách sống hiện đại.",
          brandDescriptionEn: "Refined minimalism, crafted for modern living.",
          productTitle: "Sản phẩm",
          productItems: ["Nam", "Nữ", "Áo", "Quần", "Váy", "Đồ lót", "Sale"],
          supportTitle: "Hỗ trợ",
          supportItems: ["Mua hàng", "Đổi trả", "Vận chuyển", "FAQ"],
          contactTitle: "Liên hệ",
          contactDescription: "Kết nối với MAISON qua mạng xã hội",
          copyright: "© 2026 MAISON SHOP",
          designedBy: "Designed by MrNine",
        };
  const socialItems = [
    {
      key: "facebook",
      label: "Facebook",
      href: normalizeExternalUrl(settings?.social?.facebook),
      icon: <FacebookIcon />,
    },
    {
      key: "instagram",
      label: "Instagram",
      href: normalizeExternalUrl(settings?.social?.instagram),
      icon: <InstagramIcon />,
    },
    {
      key: "tiktok",
      label: "TikTok",
      href: normalizeExternalUrl(settings?.social?.tiktok),
      icon: <TikTokIcon />,
    },
  ];

  function updateCustomerField(field, value) {
    setCustomerForm((current) => ({ ...current, [field]: value }));
  }

  function resetCustomerForm() {
    setCustomerForm({ ...EMPTY_CUSTOMER_FORM });
  }

  function closeOrderSuccessModal() {
    setOrderSuccessOpen(false);
    setQuickBuyMessage("");
    setCheckoutMessage("");
  }

  function getCustomerNameError() {
    const trimmedName = String(customerForm.name || "").trim();

    if (!trimmedName) {
      return t.required;
    }

    if (trimmedName.length < 2) {
      return t("customer_name_invalid");
    }

    return "";
  }

  async function applyVoucher() {
    const code = String(voucherInput || "").trim().toUpperCase();

    if (!code) {
      setVoucherMessage(t("voucherEmpty"));
      return;
    }

    setApplyingVoucher(true);
    setVoucherMessage("");

    try {
      const response = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();

      if (!response.ok) {
        const messageKey =
          data.message === "VOUCHER_EXCEEDED"
            ? "voucherExceeded"
            : data.message === "VOUCHER_INACTIVE"
              ? "voucherInactive"
              : "voucherInvalid";
        throw new Error(t(messageKey));
      }

      setVoucher(data.voucher);
      setVoucherInput(data.voucher.code);
      setVoucherMessage(t("voucherSuccess"));
    } catch (error) {
      setVoucher(null);
      setVoucherMessage(error.message || t("voucherInvalid"));
    } finally {
      setApplyingVoucher(false);
    }
  }

  function handleAddressImageRemove() {
    setCustomerForm((current) => ({
      ...current,
      addressImage: "",
      addressImageName: "",
    }));
  }

  async function handleAddressImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const validTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setQuickBuyMessage(t.addressImageInvalid);
      setCheckoutMessage(t.addressImageInvalid);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCustomerForm((current) => ({
        ...current,
        addressImage: String(reader.result || ""),
        addressImageName: file.name,
      }));
      setQuickBuyMessage("");
      setCheckoutMessage("");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function applyPurchasedItems(purchasedItems) {
    setCatalog((current) =>
      current.map((product) => {
        const relatedItems = purchasedItems.filter((item) => item.productId === product.id);
        if (relatedItems.length === 0) {
          return product;
        }

        const variants = product.variants.map((variant) => {
          const matchingItem = relatedItems.find((item) => item.variantId === variant.id);
          if (!matchingItem) {
            return variant;
          }

          return {
            ...variant,
            stock: Math.max(0, variant.stock - matchingItem.quantity),
          };
        });

        return {
          ...product,
          variants,
          totalStock: variants.reduce((sum, variant) => sum + variant.stock, 0),
        };
      }),
    );

    setCart((current) =>
      current
        .map((item) => {
          const matchingItem = purchasedItems.find((purchased) => purchased.variantId === item.variantId);
          if (!matchingItem) {
            return item;
          }

          return {
            ...item,
            stock: Math.max(0, item.stock - matchingItem.quantity),
          };
        })
        .filter((item) => item.stock > 0),
    );
  }

  function openProductDetails(productId) {
    setSelectedProductId(productId);
    setQuickBuyMessage("");
    setBannerMessage("");
    setViewedIds((current) => [productId, ...current.filter((id) => id !== productId)].slice(0, 8));
  }

  function handleAddToCart(item) {
    const result = mergeCartItem(cart, item);
    setCart(result.items);
    setBannerMessage(result.capped ? t.quantityLimit : "");
    setCartOpen(true);
  }

  function updateQuantity(key, nextQuantity) {
    const currentItem = cart.find((item) => item.key === key);
    if (!currentItem) {
      return;
    }

    if (nextQuantity <= 0) {
      setCart((current) => current.filter((item) => item.key !== key));
      return;
    }

    if (nextQuantity > currentItem.stock) {
      setBannerMessage(t.quantityLimit);
      nextQuantity = currentItem.stock;
    }

    setCart((current) =>
      current.map((item) => (item.key === key ? { ...item, quantity: nextQuantity } : item)),
    );
  }

  async function submitItems(items) {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: String(customerForm.name || "").trim(),
        phone: customerForm.phone,
        addressText: customerForm.addressText,
        addressImage: customerForm.addressImage,
        voucherCode: voucher?.code || "",
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || t.orderError);
    }

    return data;
  }

  async function handleQuickBuy(item) {
    const nameError = getCustomerNameError();

    if (nameError) {
      setQuickBuyMessage(nameError);
      return false;
    }

    if (!customerForm.phone || (!customerForm.addressText && !customerForm.addressImage)) {
      setQuickBuyMessage(t.required);
      return false;
    }

    setSubmitting(true);
    setQuickBuyMessage("");

    try {
      await submitItems([item]);
      applyPurchasedItems([item]);
      resetCustomerForm();
      setVoucher(null);
      setVoucherInput("");
      setVoucherMessage("");
      setBannerMessage(t.quickBuySuccess);
      setOrderSuccessOpen(true);
      return true;
    } catch (error) {
      setQuickBuyMessage(error.message || t.orderError);
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function submitCartOrder(event) {
    event.preventDefault();

    const nameError = getCustomerNameError();

    if (nameError) {
      setCheckoutMessage(nameError);
      return;
    }

    if (!customerForm.phone || (!customerForm.addressText && !customerForm.addressImage)) {
      setCheckoutMessage(t.required);
      return;
    }

    if (cart.length === 0) {
      setCheckoutMessage(t.cartEmpty);
      return;
    }

    setSubmitting(true);
    setCheckoutMessage("");

    try {
      await submitItems(cart);
      const purchasedItems = [...cart];
      applyPurchasedItems(purchasedItems);
      setCart([]);
      resetCustomerForm();
      setVoucher(null);
      setVoucherInput("");
      setVoucherMessage("");
      setCheckoutOpen(false);
      setCartOpen(false);
      setSelectedProductId(null);
      setBannerMessage(t.orderSuccess);
      setOrderSuccessOpen(true);
    } catch (error) {
      setCheckoutMessage(error.message || t.orderError);
    } finally {
      setSubmitting(false);
    }
  }

  function buildMessengerHref(product) {
    const fallbackUrl = "https://m.me/yourpage";
    const configuredUrl = String(settings.messengerUrl || fallbackUrl).trim() || fallbackUrl;
    const message = product
      ? `Mình muốn tư vấn thêm về mẫu ${product.name}`
      : "Mình muốn tư vấn thêm về sản phẩm của MAISON SHOP";

    try {
      const resolvedUrl = configuredUrl.startsWith("http")
        ? configuredUrl
        : `https://${configuredUrl}`;
      const url = new URL(resolvedUrl);
      const baseUrl = `${url.protocol}//${url.host}${url.pathname}`.replace(/\/$/, "");
      return `${baseUrl}?text=${encodeURIComponent(message)}`;
    } catch {
      const baseUrl = configuredUrl.replace(/\?.*$/, "").replace(/\/$/, "");
      return `${baseUrl}?text=${encodeURIComponent(message)}`;
    }
  }

  const languageOptions = [
    { key: "vi", label: "VIE", flag: "🇻🇳" },
    { key: "zh", label: "中文", flag: "🇹🇼" },
  ];

  return (
    <div className="min-h-screen pb-16 text-stone-900">
      <header className="sticky top-0 z-30 border-b border-[#ddd4ca] bg-[#eae3da]/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:py-4 lg:px-8">
          <Link href="/" className="group flex min-w-0 items-center gap-2 rounded-2xl px-1 py-1 sm:gap-3.5">
            <div className="flex shrink-0 items-center justify-center rounded-xl border border-[#e5ded5] bg-white/75 p-1.5 shadow-[0_8px_24px_rgba(120,95,60,0.06)] transition-colors group-hover:border-[#d8c8b6] sm:p-1.5">
              {logoVisible ? (
                <Image
                  src={BRAND_LOGO_SRC}
                  alt="MAISON"
                  width={72}
                  height={72}
                  priority
                  onError={() => setLogoVisible(false)}
                  className="h-auto w-[46px] shrink-0 rounded-[10px] object-contain transition-opacity group-hover:opacity-85 sm:w-[54px] lg:w-[68px]"
                />
              ) : (
                <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[10px] bg-white text-sm font-bold tracking-[0.2em] text-stone-900 sm:h-[54px] sm:w-[54px] lg:h-[68px] lg:w-[68px]">
                  M
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-[9px] uppercase tracking-[0.28em] text-stone-500 sm:text-[11px] sm:tracking-[0.38em]">
                MAISONSHOP.STORE
              </p>
              <h1 className="mt-1 truncate text-[0.9rem] font-extrabold tracking-[0.2em] text-stone-900 sm:text-2xl sm:tracking-[0.28em]">
                {t.logo}
              </h1>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="flex items-center rounded-full border border-stone-200 bg-white/90 p-0.5 shadow-sm sm:p-1">
              {languageOptions.map((option) => {
                const active = language === option.key;

                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setLanguage(option.key)}
                    className={`rounded-full px-2 py-1.5 text-xs transition sm:px-3 sm:py-2 sm:text-sm ${
                      active
                        ? "bg-stone-900 font-semibold text-white"
                        : "text-stone-700 hover:bg-[#f6efe2] hover:text-[#b38a45]"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 sm:gap-2">
                      <span>{option.label}</span>
                      <span aria-hidden="true">{option.flag}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative rounded-full bg-stone-900 p-3 text-white transition hover:bg-[#b38a45]"
              aria-label={t.viewCart}
            >
              <CartIcon />
              <span className="absolute -right-1 -top-1 rounded-full bg-[#b38a45] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-6 lg:px-8">
        <section className="luxury-card overflow-hidden rounded-[32px] px-4 py-5 sm:px-5 lg:px-7 lg:py-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(240px,26vw)] lg:items-start lg:gap-6">
            <div className="max-w-none sm:max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <p className="text-[clamp(10px,0.72vw,11px)] uppercase tracking-[0.38em] text-[#b38a45]">
                  {t.brand}
                </p>
                <span className="hidden h-1 w-1 rounded-full bg-[#d8c3a0] lg:inline-block" />
                <p className="text-[clamp(11px,0.8vw,12px)] text-stone-400">{currency}</p>
              </div>
              <h2
                className={`mt-2.5 max-w-[13.5ch] text-[clamp(2.2rem,5vw,4.4rem)] font-bold leading-[0.94] tracking-[-0.045em] transition-opacity duration-500 sm:max-w-[12ch] lg:max-w-[10.5ch] ${
                  heroReady ? "opacity-100" : "opacity-0"
                }`}
              >
                {activeHeroTitle}
              </h2>
              <p
                className={`mt-2 max-w-[32ch] text-[clamp(13px,1.2vw,15px)] leading-[1.65] text-stone-500 transition-opacity duration-500 sm:max-w-lg ${
                  heroReady ? "opacity-100" : "opacity-0"
                }`}
              >
                {activeHeroSubtext}
              </p>
            </div>

            <div className="w-full max-w-[360px] justify-self-start rounded-[22px] border border-white/60 bg-[linear-gradient(135deg,rgba(179,138,69,0.1),rgba(255,255,255,0.94))] p-[clamp(10px,1.1vw,14px)] shadow-[0_10px_24px_rgba(43,34,24,0.04)] sm:max-w-none lg:justify-self-end">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[clamp(10px,0.72vw,11px)] uppercase tracking-[0.32em] text-stone-400">
                  {t("tagFilterLabel")}
                </p>
                <div className="rounded-full bg-white/90 px-2.5 py-1 text-[clamp(10px,0.78vw,11px)] font-medium text-stone-500">
                  {cartCount} {t.cartCount}
                </div>
              </div>

              <TagList tags={tags} activeSlug={activeTagSlug} allLabel={t.all} />

              <div className="mt-2.5 grid grid-cols-2 gap-2 text-[clamp(13px,0.95vw,14px)] text-stone-500">
                <div className="rounded-[18px] border border-white/70 bg-white/90 px-3 py-2.5">
                  <p className="text-[clamp(9px,0.68vw,10px)] uppercase tracking-[0.24em] text-stone-400">
                    {t.currencyLabel}
                  </p>
                  <p className="mt-1 text-[clamp(13px,1vw,15px)] font-semibold text-stone-900">
                    {currency}
                  </p>
                </div>
                <div className="rounded-[18px] border border-white/70 bg-white/90 px-3 py-2.5">
                  <p className="text-[clamp(9px,0.68vw,10px)] uppercase tracking-[0.24em] text-stone-400">
                    {t.cart}
                  </p>
                  <p className="mt-1 text-[clamp(13px,1vw,15px)] font-semibold text-stone-900">
                    {cartCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {bannerMessage ? (
          <div className="mt-6 rounded-3xl border border-[#b38a45]/20 bg-white/80 px-5 py-4 text-sm text-stone-700">
            {bannerMessage}
          </div>
        ) : null}

        <ProductList
          products={filteredProducts}
          currency={currency}
          language={language}
          t={t}
          onProductSelect={openProductDetails}
          emptyMessage={
            activeTag
              ? t("emptyTagState", { tag: activeTag.name })
              : t.emptyState
          }
        />

        {recentlyViewedProducts.length > 0 ? (
          <section className="mt-12">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-stone-900">{t.recentlyViewed}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
              {recentlyViewedProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => openProductDetails(product.id)}
                  className="luxury-card overflow-hidden rounded-[28px] p-3 text-left"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="aspect-[4/5] w-full rounded-[20px] object-cover"
                  />
                  <div className="pt-4">
                    <p className="font-semibold text-stone-900">{product.name}</p>
                    <p className="mt-2 text-sm text-stone-500">
                      {formatCurrency(
                        getDiscountedUnitPrice(product.basePrice, product.discountPercent),
                        currency,
                        language,
                      )}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <footer className="mt-10 pb-6">
          <div className="luxury-card w-full rounded-[32px] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.95fr)] lg:gap-10">
              <div className="space-y-4 lg:max-w-[320px]">
                <h3 className="text-xl font-bold tracking-[0.18em] text-stone-900">
                  {footerContent.brandTitle}
                </h3>
                <div className="space-y-3 text-sm leading-7 text-stone-500/80">
                  <p>{footerContent.brandDescription}</p>
                  <p>{footerContent.brandDescriptionEn}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold tracking-[0.18em] text-stone-900">
                  {footerContent.productTitle}
                </h4>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-stone-500/80">
                  {footerContent.productItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold tracking-[0.18em] text-stone-900">
                  {footerContent.supportTitle}
                </h4>
                <ul className="space-y-3 text-sm leading-7 text-stone-500/80">
                  {footerContent.supportItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4 lg:justify-self-end">
                <h4 className="text-sm font-semibold tracking-[0.18em] text-stone-900">
                  {footerContent.contactTitle}
                </h4>
                <p className="max-w-[240px] text-sm leading-7 text-stone-500/80">
                  {footerContent.contactDescription}
                </p>
                <div className="mt-3 flex items-center gap-3 sm:gap-4">
                  {socialItems.map((item) =>
                    item.href ? (
                      <a
                        key={item.key}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.label}
                        className="group inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/80 text-stone-500/70 transition duration-200 hover:scale-105 hover:text-stone-900"
                      >
                        <span className="opacity-80 transition duration-200 group-hover:opacity-100">
                          {item.icon}
                        </span>
                        <span className="sr-only">{item.label}</span>
                      </a>
                    ) : (
                      <span
                        key={item.key}
                        aria-hidden="true"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f6efe2] text-stone-300"
                      >
                        {item.icon}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-2 border-t border-stone-200/80 pt-5 text-xs text-stone-500/75 sm:flex-row sm:items-center sm:justify-between">
              <p className="tracking-[0.18em] text-stone-400/90">{footerContent.copyright}</p>
              <p>{footerContent.designedBy}</p>
            </div>
          </div>
        </footer>
      </main>

      <a
        href={buildMessengerHref(selectedProduct, null)}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-20 rounded-full bg-[#b38a45] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-stone-900"
      >
        {t.messenger}
      </a>

      <div
        className={`fixed inset-0 z-40 bg-stone-900/35 transition ${cartOpen ? "visible opacity-100" : "invisible opacity-0"}`}
        onClick={() => setCartOpen(false)}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-[#fffdf9] p-6 shadow-2xl transition duration-300 ${cartOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-stone-400">{t.cart}</p>
            <h3 className="mt-2 text-2xl font-bold">
              {cartCount} {t.cartCount}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-600"
          >
            {t.close}
          </button>
        </div>

        <div className="mt-6 flex-1 space-y-4 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-stone-300 px-6 py-12 text-center text-sm text-stone-500">
              {t.cartEmpty}
            </div>
          ) : null}

          {cart.map((item) => (
            <div key={item.key} className="rounded-[28px] border border-stone-200 bg-white p-4">
              <div className="flex gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-24 w-20 rounded-2xl object-cover"
                />

                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="mt-1 text-sm text-stone-500">
                        {fillTemplate(t.variantInfo, {
                          size: item.size,
                          color: item.color,
                        })}
                      </p>
                      <div className="mt-1">
                        {item.discountPercent > 0 ? (
                          <p className="text-xs text-stone-400 line-through">
                            {formatCurrency(item.price, currency, language)}
                          </p>
                        ) : null}
                        <p className="text-sm text-stone-500">
                          {formatCurrency(
                            getDiscountedUnitPrice(item.price, item.discountPercent),
                            currency,
                            language,
                          )}
                        </p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.discountPercent > 0 ? (
                          <span className="rounded-full bg-stone-900 px-2 py-1 text-[10px] text-white">
                            {t("discountBadge", { percent: item.discountPercent })}
                          </span>
                        ) : null}
                        {item.isFreeShip ? (
                          <span className="rounded-full bg-[#f6efe2] px-2 py-1 text-[10px] text-[#b38a45]">
                            {t("freeShipBadge")}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.key, 0)}
                      className="text-sm text-stone-400"
                    >
                      {t.remove}
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2 rounded-full border border-stone-200 px-2 py-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.key, item.quantity - 1)}
                        className="h-8 w-8 rounded-full text-lg"
                      >
                        -
                      </button>
                      <span className="min-w-6 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        className="h-8 w-8 rounded-full text-lg"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(
                        getLineTotal(item.price, item.quantity, item.discountPercent),
                        currency,
                        language,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[28px] border border-stone-200 bg-white p-5">
          <div className="flex items-center justify-between text-sm text-stone-500">
            <span>{t.subtotal}</span>
            <span className="text-lg font-bold text-stone-900">
              {formatCurrency(pricing.subtotal, currency, language)}
            </span>
          </div>
          {pricing.productSavings > 0 ? (
            <p className="mt-3 text-sm text-stone-500">
              {t("checkoutPromotionSavings")}:{" "}
              {formatCurrency(pricing.productSavings, currency, language)}
            </p>
          ) : null}
          <div className="mt-4 flex gap-2">
            <input
              value={voucherInput}
              onChange={(event) => setVoucherInput(event.target.value.toUpperCase())}
              placeholder={t("voucherPlaceholder")}
              className="flex-1 rounded-full border border-stone-200 bg-white px-4 py-3 text-sm"
            />
            <button
              type="button"
              disabled={applyingVoucher}
              onClick={applyVoucher}
              className="rounded-full border border-stone-300 px-4 py-3 text-sm text-stone-700"
            >
              {applyingVoucher ? t("commonLoading") : t("voucherApply")}
            </button>
          </div>
          {voucher ? (
            <p className="mt-3 text-sm text-[#b38a45]">
              {t("voucherApplied", { code: voucher.code })}
            </p>
          ) : null}
          {voucherMessage ? <p className="mt-2 text-sm text-stone-500">{voucherMessage}</p> : null}
          {pricing.voucherDiscount > 0 ? (
            <div className="mt-3 flex items-center justify-between text-sm text-stone-500">
              <span>{t("checkoutVoucherDiscount")}</span>
              <span>-{formatCurrency(pricing.voucherDiscount, currency, language)}</span>
            </div>
          ) : null}
          <div className="mt-3 flex items-center justify-between text-sm text-stone-500">
            <span>{t("checkoutGrandTotal")}</span>
            <span className="text-lg font-bold text-stone-900">
              {formatCurrency(total, currency, language)}
            </span>
          </div>
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={() => {
              setCheckoutOpen(true);
              setCheckoutMessage("");
            }}
            className="mt-4 w-full rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#b38a45] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t.checkout}
          </button>
        </div>
      </aside>

      {checkoutOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-900/45 px-4 py-8">
          <div className="luxury-card max-h-full w-full max-w-3xl overflow-y-auto rounded-[32px] p-6 lg:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-stone-400">{t.checkoutTitle}</p>
                <h3 className="mt-2 text-2xl font-bold">{t.customerInfo}</h3>
                <p className="mt-2 text-sm text-stone-500">{t.restoreInfo}</p>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutOpen(false)}
                className="rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-600"
              >
                {t.close}
              </button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <form className="space-y-4" onSubmit={submitCartOrder}>
                <label className="block space-y-2 text-sm text-stone-600">
                  <span>{t("customer_name")}</span>
                  <input
                    name="name"
                    required
                    minLength={2}
                    placeholder={t("customer_name_placeholder")}
                    value={customerForm.name}
                    onChange={(event) => updateCustomerField("name", event.target.value)}
                    className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
                  />
                </label>
                <label className="block space-y-2 text-sm text-stone-600">
                  <span>{t.phone}</span>
                  <input
                    required
                    value={customerForm.phone}
                    onChange={(event) => updateCustomerField("phone", event.target.value)}
                    className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
                  />
                </label>
                <label className="block space-y-2 text-sm text-stone-600">
                  <span>{t.address}</span>
                  <textarea
                    rows={4}
                    value={customerForm.addressText}
                    onChange={(event) => updateCustomerField("addressText", event.target.value)}
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
                  onFileChange={handleAddressImageChange}
                  onRemove={handleAddressImageRemove}
                />

                {checkoutMessage ? <p className="text-sm text-stone-600">{checkoutMessage}</p> : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#b38a45] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? t("submitting") : t("submitOrder")}
                </button>
              </form>

              <div className="rounded-[28px] bg-white p-5">
                <p className="text-sm font-semibold text-stone-900">{t.orderSummary}</p>
                <div className="mt-4 space-y-3">
                  {cart.map((item) => (
                    <div key={item.key} className="flex items-center justify-between gap-4 text-sm">
                      <div>
                        <p className="font-medium text-stone-800">{item.name}</p>
                        <p className="text-stone-400">
                          {fillTemplate(t.variantInfo, {
                            size: item.size,
                            color: item.color,
                          })}
                        </p>
                        <p className="text-stone-400">x{item.quantity}</p>
                      </div>
                      <p className="font-semibold text-stone-800">
                        {formatCurrency(
                          getLineTotal(item.price, item.quantity, item.discountPercent),
                          currency,
                          language,
                        )}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 border-t border-stone-200 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-stone-500">{t("checkoutBeforeVoucher")}</span>
                    <span className="text-xl font-bold text-stone-900">
                      {formatCurrency(pricing.subtotal, currency, language)}
                    </span>
                  </div>
                  {pricing.voucherDiscount > 0 ? (
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-stone-500">{t("checkoutVoucherDiscount")}</span>
                      <span className="text-sm font-semibold text-stone-900">
                        -{formatCurrency(pricing.voucherDiscount, currency, language)}
                      </span>
                    </div>
                  ) : null}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-stone-500">{t("checkoutGrandTotal")}</span>
                    <span className="text-xl font-bold text-stone-900">
                      {formatCurrency(total, currency, language)}
                    </span>
                  </div>
                  {cart.some((item) => item.isFreeShip) ? (
                    <p className="mt-3 text-sm text-[#b38a45]">{t("checkoutFreeShip")}</p>
                  ) : null}
                  <p className="mt-3 text-sm text-stone-400">{t.thankYou}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {orderSuccessOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-stone-900/45 px-4">
          <div className="luxury-card w-full max-w-md rounded-[28px] p-6 text-center sm:p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f6efe2] text-2xl">
              {"\uD83C\uDF89"}
            </div>
            <h3 className="mt-5 text-2xl font-bold text-stone-900">
              {t("orderSuccessModalTitle")}
            </h3>
            <p className="mt-3 text-sm leading-7 text-stone-500">
              {t("orderSuccessModalDescription")}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={closeOrderSuccessModal}
                className="rounded-full border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-300"
              >
                {t.close}
              </button>
              <button
                type="button"
                onClick={closeOrderSuccessModal}
                className="rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#b38a45]"
              >
                {t("continueShopping")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ProductDetailSheet
        product={selectedProduct}
        products={catalog}
        fomoItems={fomoItems}
        open={Boolean(selectedProduct)}
        language={language}
        currency={currency}
        t={t}
        customerForm={customerForm}
        onCustomerChange={updateCustomerField}
        onAddressImageChange={handleAddressImageChange}
        onAddressImageRemove={handleAddressImageRemove}
        onClose={() => setSelectedProductId(null)}
        onAddToCart={handleAddToCart}
        onQuickBuy={handleQuickBuy}
        onOpenRelatedProduct={openProductDetails}
        buildMessengerHref={buildMessengerHref}
        quickBuyMessage={quickBuyMessage}
        quickBuySubmitting={submitting}
      />
    </div>
  );
}
