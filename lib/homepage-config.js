export const HOMEPAGE_CONTENT_SETTING_KEY = "homepageContent";

export const HOMEPAGE_SECTION_KEYS = ["newArrivals", "sale", "bestSeller"];
export const HOMEPAGE_SECTION_SOURCES = ["newest", "sale", "tag"];

export const defaultHomepageContent = {
  hero: {
    eyebrowVi: "Bộ sưu tập chủ đạo",
    eyebrowZh: "本季主題",
    titleVi: "Tinh giản trong thiết kế, nổi bật trong phong cách",
    titleZh: "極簡設計，風格格外出眾",
    subtitleVi:
      "Tinh tế trong từng lựa chọn, dành cho nhịp sống hiện đại và linh hoạt mỗi ngày.",
    subtitleZh: "以簡約輪廓與細膩質感，陪伴你的日常與風格節奏。",
    imageUrl: "",
    imageAlt: "MAISON hero campaign",
  },
  sections: [
    {
      key: "newArrivals",
      enabled: true,
      source: "newest",
      tagSlug: "",
      limit: 4,
      titleVi: "Mới về",
      titleZh: "新品上架",
      descriptionVi: "Những thiết kế vừa cập nhật để làm mới tủ đồ tuần này.",
      descriptionZh: "剛上架的新作，適合用來更新本週衣櫥。",
    },
    {
      key: "sale",
      enabled: true,
      source: "sale",
      tagSlug: "",
      limit: 4,
      titleVi: "Đang giảm giá",
      titleZh: "限時折扣",
      descriptionVi: "Các mẫu đang có ưu đãi nổi bật để đẩy chuyển đổi nhanh trên homepage.",
      descriptionZh: "精選折扣款式，適合放在首頁快速帶動轉換。",
    },
    {
      key: "bestSeller",
      enabled: true,
      source: "tag",
      tagSlug: "ban-chay",
      limit: 4,
      titleVi: "Bán chạy",
      titleZh: "熱賣推薦",
      descriptionVi: "Nhóm sản phẩm bán tốt để tăng social proof ngay từ trang chủ.",
      descriptionZh: "高轉換熱賣款，適合放在首頁作為社會證明。",
    },
  ],
  announcementBar: {
    enabled: false,
    startAt: "",
    endAt: "",
    titleVi: "",
    titleZh: "",
    messageVi: "",
    messageZh: "",
    voucherCode: "",
    tagSlug: "",
    ctaLabelVi: "",
    ctaLabelZh: "",
    ctaUrl: "",
  },
  campaignPopup: {
    enabled: false,
    startAt: "",
    endAt: "",
    titleVi: "",
    titleZh: "",
    messageVi: "",
    messageZh: "",
    voucherCode: "",
    tagSlug: "",
    ctaLabelVi: "",
    ctaLabelZh: "",
    ctaUrl: "",
  },
};

function cloneDefaultHomepageContent() {
  return JSON.parse(JSON.stringify(defaultHomepageContent));
}

function normalizeText(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function normalizeUpperText(value, fallback = "") {
  return normalizeText(value, fallback).toUpperCase();
}

function normalizeLowerText(value, fallback = "") {
  return normalizeText(value, fallback).toLowerCase();
}

function normalizeCount(value, fallback, min = 1, max = 12) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, parsed));
}

function normalizeDateTime(value) {
  const rawValue = normalizeText(value);
  if (!rawValue) {
    return "";
  }

  const parsed = new Date(rawValue);
  return Number.isNaN(parsed.getTime()) ? "" : rawValue;
}

function normalizeSection(sectionInput, fallbackSection) {
  const fallback = fallbackSection || {};
  const source = HOMEPAGE_SECTION_SOURCES.includes(sectionInput?.source)
    ? sectionInput.source
    : fallback.source || "newest";

  return {
    key: fallback.key,
    enabled: sectionInput?.enabled !== false,
    source,
    tagSlug: normalizeLowerText(sectionInput?.tagSlug, fallback.tagSlug),
    limit: normalizeCount(sectionInput?.limit, fallback.limit || 4),
    titleVi: normalizeText(sectionInput?.titleVi, fallback.titleVi),
    titleZh: normalizeText(sectionInput?.titleZh, fallback.titleZh),
    descriptionVi: normalizeText(sectionInput?.descriptionVi, fallback.descriptionVi),
    descriptionZh: normalizeText(sectionInput?.descriptionZh, fallback.descriptionZh),
  };
}

function normalizeCampaign(campaignInput, fallbackCampaign) {
  const fallback = fallbackCampaign || {};

  return {
    enabled: Boolean(campaignInput?.enabled),
    startAt: normalizeDateTime(campaignInput?.startAt || fallback.startAt),
    endAt: normalizeDateTime(campaignInput?.endAt || fallback.endAt),
    titleVi: normalizeText(campaignInput?.titleVi, fallback.titleVi),
    titleZh: normalizeText(campaignInput?.titleZh, fallback.titleZh),
    messageVi: normalizeText(campaignInput?.messageVi, fallback.messageVi),
    messageZh: normalizeText(campaignInput?.messageZh, fallback.messageZh),
    voucherCode: normalizeUpperText(campaignInput?.voucherCode, fallback.voucherCode),
    tagSlug: normalizeLowerText(campaignInput?.tagSlug, fallback.tagSlug),
    ctaLabelVi: normalizeText(campaignInput?.ctaLabelVi, fallback.ctaLabelVi),
    ctaLabelZh: normalizeText(campaignInput?.ctaLabelZh, fallback.ctaLabelZh),
    ctaUrl: normalizeText(campaignInput?.ctaUrl, fallback.ctaUrl),
  };
}

export function sanitizeHomepageContent(input) {
  const base = cloneDefaultHomepageContent();
  const heroInput = input?.hero || {};
  const sectionsInput = Array.isArray(input?.sections) ? input.sections : [];

  return {
    hero: {
      eyebrowVi: normalizeText(heroInput.eyebrowVi, base.hero.eyebrowVi),
      eyebrowZh: normalizeText(heroInput.eyebrowZh, base.hero.eyebrowZh),
      titleVi: normalizeText(heroInput.titleVi, base.hero.titleVi),
      titleZh: normalizeText(heroInput.titleZh, base.hero.titleZh),
      subtitleVi: normalizeText(heroInput.subtitleVi, base.hero.subtitleVi),
      subtitleZh: normalizeText(heroInput.subtitleZh, base.hero.subtitleZh),
      imageUrl: normalizeText(heroInput.imageUrl, base.hero.imageUrl),
      imageAlt: normalizeText(heroInput.imageAlt, base.hero.imageAlt),
    },
    sections: HOMEPAGE_SECTION_KEYS.map((key, index) => {
      const fallbackSection = base.sections[index];
      const matchingSection =
        sectionsInput.find((section) => section?.key === key) || sectionsInput[index] || {};
      return normalizeSection(matchingSection, fallbackSection);
    }),
    announcementBar: normalizeCampaign(input?.announcementBar, base.announcementBar),
    campaignPopup: normalizeCampaign(input?.campaignPopup, base.campaignPopup),
  };
}

export function parseHomepageContent(rawValue) {
  if (!rawValue) {
    return cloneDefaultHomepageContent();
  }

  try {
    return sanitizeHomepageContent(JSON.parse(rawValue));
  } catch {
    return cloneDefaultHomepageContent();
  }
}

export function getLocalizedHomepageText(language, vietnameseValue, chineseValue, fallback = "") {
  if (language === "zh") {
    return normalizeText(chineseValue || vietnameseValue || fallback);
  }

  return normalizeText(vietnameseValue || chineseValue || fallback);
}

export function isCampaignActive(campaign, now = new Date()) {
  if (!campaign?.enabled) {
    return false;
  }

  const startDate = campaign.startAt ? new Date(campaign.startAt) : null;
  if (startDate && !Number.isNaN(startDate.getTime()) && now < startDate) {
    return false;
  }

  const endDate = campaign.endAt ? new Date(campaign.endAt) : null;
  if (endDate && !Number.isNaN(endDate.getTime()) && now > endDate) {
    return false;
  }

  return true;
}

export function resolveCampaignHref(campaign) {
  const directUrl = normalizeText(campaign?.ctaUrl);
  if (directUrl) {
    return directUrl;
  }

  const tagSlug = normalizeLowerText(campaign?.tagSlug);
  if (tagSlug) {
    return `/tag/${tagSlug}`;
  }

  return "";
}
