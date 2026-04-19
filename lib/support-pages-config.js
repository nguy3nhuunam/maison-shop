export const SUPPORT_PAGES_SETTING_KEY = "supportPages";

export const defaultSupportPages = [
  {
    key: "shoppingGuide",
    slug: "mua-hang",
    labelVi: "Mua hàng",
    labelZh: "購物指南",
    titleVi: "Hướng dẫn mua hàng",
    titleZh: "購物指南",
    summaryVi: "Các bước đặt hàng nhanh tại MAISON SHOP.",
    summaryZh: "在 MAISON SHOP 快速下單的流程說明。",
    contentVi:
      "1. Chọn sản phẩm, size và màu phù hợp.\n2. Thêm vào giỏ hoặc mua nhanh ngay trong popup sản phẩm.\n3. Điền tên, số điện thoại và địa chỉ nhận hàng.\n4. Kiểm tra lại voucher, tổng tiền và gửi đơn.\n5. Admin sẽ liên hệ xác nhận trước khi xử lý đơn hàng.",
    contentZh:
      "1. 選擇想要的商品、尺寸與顏色。\n2. 加入購物車或直接快速下單。\n3. 填寫姓名、電話與收件資訊。\n4. 檢查優惠碼與訂單總額後送出。\n5. 管理員會先聯繫確認，再安排後續處理。",
  },
  {
    key: "returnPolicy",
    slug: "doi-tra",
    labelVi: "Đổi trả",
    labelZh: "退換貨",
    titleVi: "Chính sách đổi trả",
    titleZh: "退換貨政策",
    summaryVi: "Điều kiện và thời hạn đổi trả dành cho khách hàng.",
    summaryZh: "提供給顧客的退換貨條件與時限說明。",
    contentVi:
      "1. Hỗ trợ đổi size hoặc màu trong thời gian quy định.\n2. Sản phẩm cần còn nguyên tem, chưa qua sử dụng và giữ đúng hiện trạng ban đầu.\n3. Vui lòng liên hệ fanpage hoặc hotline trước khi gửi hàng đổi trả.\n4. Các sản phẩm sale sâu hoặc theo campaign riêng có thể áp dụng điều kiện khác.",
    contentZh:
      "1. 可於規定時間內申請更換尺寸或顏色。\n2. 商品需保持吊牌完整、未使用且維持原始狀態。\n3. 退換前請先聯繫粉專或客服確認。\n4. 特價商品或特別活動商品可能適用不同條件。",
  },
  {
    key: "shippingInfo",
    slug: "van-chuyen",
    labelVi: "Vận chuyển",
    labelZh: "配送資訊",
    titleVi: "Thông tin vận chuyển",
    titleZh: "配送資訊",
    summaryVi: "Thời gian xử lý đơn và các lưu ý giao hàng.",
    summaryZh: "訂單處理時間與配送注意事項。",
    contentVi:
      "1. Đơn hàng thường được xác nhận trong giờ làm việc.\n2. Thời gian giao hàng tùy theo khu vực nhận.\n3. Shop sẽ gửi thông tin vận đơn khi đơn đã bàn giao cho đơn vị vận chuyển.\n4. Với đơn cần gấp, vui lòng nhắn trực tiếp để được hỗ trợ ưu tiên.",
    contentZh:
      "1. 訂單通常會在營業時間內完成確認。\n2. 配送時間依收件地區而有所不同。\n3. 商品交寄後，店鋪會提供物流單號。\n4. 若有急件需求，請直接聯繫以便優先協助。",
  },
  {
    key: "faq",
    slug: "faq",
    labelVi: "FAQ",
    labelZh: "常見問題",
    titleVi: "Câu hỏi thường gặp",
    titleZh: "常見問題",
    summaryVi: "Giải đáp nhanh những câu hỏi khách hay gặp nhất.",
    summaryZh: "快速整理顧客最常詢問的問題。",
    contentVi:
      "1. Có thể giữ đơn trong bao lâu?\nShop sẽ xác nhận thời gian giữ đơn tùy từng sản phẩm.\n\n2. Có hỗ trợ tư vấn size không?\nCó. Bạn có thể nhắn shop để được tư vấn theo chiều cao, cân nặng và form mặc mong muốn.\n\n3. Có xem ảnh thật trước khi mua không?\nShop có thể gửi thêm ảnh hoặc video thực tế nếu mẫu còn sẵn.",
    contentZh:
      "1. 訂單可以保留多久？\n店鋪會依商品狀況確認保留時間。\n\n2. 是否提供尺寸建議？\n可以，請提供身高、體重與想要的穿著感受。\n\n3. 購買前可以看實拍嗎？\n若商品仍有現貨，店鋪可再補充實拍照片或影片。",
  },
];

function cloneDefaultSupportPages() {
  return JSON.parse(JSON.stringify(defaultSupportPages));
}

function normalizeText(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function normalizeSlug(value, fallback = "") {
  return normalizeText(value, fallback)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeSupportPage(input, fallbackPage) {
  const fallback = fallbackPage || {};

  return {
    key: fallback.key,
    slug: normalizeSlug(input?.slug, fallback.slug),
    labelVi: normalizeText(input?.labelVi, fallback.labelVi),
    labelZh: normalizeText(input?.labelZh, fallback.labelZh),
    titleVi: normalizeText(input?.titleVi, fallback.titleVi),
    titleZh: normalizeText(input?.titleZh, fallback.titleZh),
    summaryVi: normalizeText(input?.summaryVi, fallback.summaryVi),
    summaryZh: normalizeText(input?.summaryZh, fallback.summaryZh),
    contentVi: normalizeText(input?.contentVi, fallback.contentVi),
    contentZh: normalizeText(input?.contentZh, fallback.contentZh),
  };
}

export function sanitizeSupportPages(input) {
  const source = Array.isArray(input) ? input : [];
  const base = cloneDefaultSupportPages();

  return base.map((page, index) => {
    const matchingPage = source.find((item) => item?.key === page.key) || source[index] || {};
    return normalizeSupportPage(matchingPage, page);
  });
}

export function parseSupportPages(rawValue) {
  if (!rawValue) {
    return cloneDefaultSupportPages();
  }

  try {
    return sanitizeSupportPages(JSON.parse(rawValue));
  } catch {
    return cloneDefaultSupportPages();
  }
}

export function getSupportPageBySlug(pages, slug) {
  const normalizedSlug = normalizeSlug(slug);
  return sanitizeSupportPages(pages).find((page) => page.slug === normalizedSlug) || null;
}
