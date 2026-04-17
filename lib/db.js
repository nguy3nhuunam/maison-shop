import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { connectToDatabase, isMongoConfigured } from "@/lib/mongodb";
import Counter from "@/models/Counter";
import Fomo from "@/models/Fomo";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Setting from "@/models/Setting";
import Voucher from "@/models/Voucher";

const defaultSettings = {
  currency: "TWD",
  messengerUrl: "https://m.me/yourpage",
};
const defaultSocialSettings = {
  facebook: "",
  instagram: "",
  tiktok: "",
};
const settingDefaults = {
  currency: defaultSettings.currency,
  messengerUrl: defaultSettings.messengerUrl,
  socialFacebook: defaultSocialSettings.facebook,
  socialInstagram: defaultSocialSettings.instagram,
  socialTiktok: defaultSocialSettings.tiktok,
};
const GOOGLE_SHEETS_SETTING_KEY = "googleSheets";
const defaultGoogleSheetsSettings = {
  clientEmail: "",
  privateKey: "",
  sheetId: "",
  enabled: false,
};

const seedProducts = [
  {
    name: "Blazer Kem Drap",
    shortDescription: "Dang suong gon, de len form va phoi nhanh cho ngay ban ron.",
    description: "Dang suong gon, de len form va phoi nhanh cho ngay ban ron.",
    price: 1680,
    images: ["/products/look-01.svg"],
    category: "nu",
    genderType: "female",
    status: "active",
    variants: [
      { size: "S", color: "Den", stock: 4 },
      { size: "M", color: "Den", stock: 6 },
      { size: "L", color: "Be", stock: 3 },
    ],
    reviews: [
      { name: "Linh", content: "Mac len gon nguoi, chat vai dep.", rating: 5 },
      { name: "Mai", content: "Form dep va de mix voi quan tay.", rating: 5 },
      { name: "Nhi", content: "Len dang nhanh, giao dien mua rat de.", rating: 4 },
    ],
  },
  {
    name: "So Mi Lua Co Mem",
    shortDescription: "Chat mem nhe, de mac rieng hoac khoac ngoai.",
    description: "Chat mem nhe, de mac rieng hoac khoac ngoai.",
    price: 1280,
    images: ["/products/look-02.svg"],
    category: "nu",
    genderType: "female",
    status: "active",
    variants: [
      { size: "S", color: "Trang kem", stock: 5 },
      { size: "M", color: "Trang kem", stock: 7 },
      { size: "L", color: "Be", stock: 2 },
    ],
    reviews: [
      { name: "Hoa", content: "Vai mem va mac rat mat.", rating: 5 },
      { name: "Trang", content: "Rat hop de di lam hang ngay.", rating: 4 },
      { name: "Vy", content: "Anh san pham va thuc te rat gan nhau.", rating: 5 },
    ],
  },
  {
    name: "Ao Len Fine Gauge",
    shortDescription: "Len min, giu dang gon va hop layering toi gian.",
    description: "Len min, giu dang gon va hop layering toi gian.",
    price: 1420,
    images: ["/products/look-03.svg"],
    category: "nam",
    genderType: "male",
    status: "active",
    variants: [
      { size: "M", color: "Xam", stock: 5 },
      { size: "L", color: "Xam", stock: 5 },
      { size: "XL", color: "Den", stock: 2 },
    ],
    reviews: [
      { name: "Bao", content: "Mac gon va khong bi day nang.", rating: 5 },
      { name: "Khanh", content: "Len min, de phoi blazer.", rating: 4 },
      { name: "Minh", content: "Chat vai on, se mua them mau khac.", rating: 5 },
    ],
  },
  {
    name: "Quan Tay Ong Rong",
    shortDescription: "Cap cao, ong dung, ton tong the thanh va gon.",
    description: "Cap cao, ong dung, ton tong the thanh va gon.",
    price: 1540,
    images: ["/products/look-04.svg"],
    category: "nu",
    genderType: "female",
    status: "active",
    variants: [
      { size: "S", color: "Be", stock: 4 },
      { size: "M", color: "Be", stock: 6 },
      { size: "L", color: "Den", stock: 2 },
    ],
    reviews: [
      { name: "Yen", content: "Quan dung form va ton dang.", rating: 5 },
      { name: "Diep", content: "Cap cao mac rat dep.", rating: 5 },
      { name: "Nga", content: "Mau be rat sang, de mix.", rating: 4 },
    ],
  },
  {
    name: "Ao Khoac Coach",
    shortDescription: "Phom khoac nam sach, nhe va linh hoat cho moi ngay.",
    description: "Phom khoac nam sach, nhe va linh hoat cho moi ngay.",
    price: 1890,
    images: ["/products/look-05.svg"],
    category: "nam",
    genderType: "male",
    status: "active",
    variants: [
      { size: "M", color: "Xanh reu", stock: 4 },
      { size: "L", color: "Xanh reu", stock: 5 },
      { size: "XL", color: "Den", stock: 1 },
    ],
    reviews: [
      { name: "Tuan", content: "Khoac len gon va rat hien dai.", rating: 5 },
      { name: "Phuc", content: "Dang ao dep, hop mac di choi.", rating: 4 },
      { name: "Nam", content: "Mau xanh reu rat de phoi.", rating: 5 },
    ],
  },
  {
    name: "Polo Knit Signature",
    shortDescription: "Be mat sach, len outfit nhanh ma van sang.",
    description: "Be mat sach, len outfit nhanh ma van sang.",
    price: 1360,
    images: ["/products/look-06.svg"],
    category: "nam",
    genderType: "male",
    status: "active",
    variants: [
      { size: "M", color: "Nau", stock: 5 },
      { size: "L", color: "Nau", stock: 4 },
      { size: "XL", color: "Kem", stock: 3 },
    ],
    reviews: [
      { name: "Huy", content: "Mac len lich su nhung van tre.", rating: 5 },
      { name: "Duc", content: "Vai det min, rat on trong tam gia.", rating: 4 },
      { name: "Long", content: "Hang giao nhanh va form chuan.", rating: 5 },
    ],
  },
  {
    name: "Vay Midi Satin",
    shortDescription: "Do ru nhe, ton dang va de mix blazer hoac cardigan.",
    description: "Do ru nhe, ton dang va de mix blazer hoac cardigan.",
    price: 1760,
    images: ["/products/look-07.svg"],
    category: "nu",
    genderType: "female",
    status: "active",
    variants: [
      { size: "S", color: "Hong nude", stock: 3 },
      { size: "M", color: "Hong nude", stock: 5 },
      { size: "L", color: "Dong", stock: 2 },
    ],
    reviews: [
      { name: "An", content: "Vai ru dep va len dang nu tinh.", rating: 5 },
      { name: "Han", content: "Mau hong nude mac rat ton da.", rating: 5 },
      { name: "Quynh", content: "Dang vay de di tiec nhe.", rating: 4 },
    ],
  },
  {
    name: "Quan Pleat Straight",
    shortDescription: "Ly quan sac, dang suong vua, dung cho ca di lam va di choi.",
    description: "Ly quan sac, dang suong vua, dung cho ca di lam va di choi.",
    price: 1480,
    images: ["/products/look-08.svg"],
    category: "nam",
    genderType: "male",
    status: "active",
    variants: [
      { size: "M", color: "Nau da", stock: 5 },
      { size: "L", color: "Nau da", stock: 4 },
      { size: "XL", color: "Kem", stock: 2 },
    ],
    reviews: [
      { name: "Son", content: "Quan len ly dep, mac rat gon.", rating: 5 },
      { name: "Dat", content: "Di lam rat hop, khong bi gia.", rating: 4 },
      { name: "Kiet", content: "Dang suong vua va de mang giay tay.", rating: 5 },
    ],
  },
];

const seedFomoItems = [
  {
    title: "Best seller",
    content: "{{count}} khach vua them san pham nay vao gio trong hom nay",
    type: "sales",
    isActive: true,
  },
  {
    title: "Ton kho",
    content: "Chi con {{stock}} san pham cho bien the ban dang xem",
    type: "stock",
    isActive: true,
  },
];

let seedPromise;

function parseId(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function buildVariantKey(size, color) {
  return `${String(size || "").trim().toLowerCase()}::${String(color || "").trim().toLowerCase()}`;
}

async function getNextSequence(key) {
  await connectToDatabase();
  const counter = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  ).lean();

  return Number(counter.seq);
}

async function ensureDefaultSettings() {
  const operations = Object.entries(settingDefaults).map(([key, value]) => ({
    updateOne: {
      filter: { key },
      update: { $setOnInsert: { value } },
      upsert: true,
    },
  }));

  if (operations.length > 0) {
    await Setting.bulkWrite(operations, { ordered: false });
  }
}

function maskPrivateKey(value) {
  return value ? "******" : "";
}

function serializeGoogleSheetsSettings(row, options = {}) {
  const settings = {
    ...defaultGoogleSheetsSettings,
    clientEmail: row?.clientEmail || "",
    sheetId: row?.sheetId || "",
    enabled: Boolean(row?.enabled),
  };
  const privateKey = row?.privateKey || "";
  const configured = Boolean(settings.clientEmail && settings.sheetId && privateKey);

  return {
    ...settings,
    configured,
    exists: Boolean(row),
    hasPrivateKey: Boolean(privateKey),
    privateKeyMasked: maskPrivateKey(privateKey),
    ...(options.includePrivateKey ? { privateKey } : {}),
  };
}

function serializeReview(review) {
  return {
    id: Number(review.id),
    name: review.name,
    content: review.content,
    rating: Number(review.rating || 5),
    createdAt: new Date(review.createdAt).toISOString(),
  };
}

function serializeProduct(product) {
  const shortDescription = String(product.shortDescription || product.description || "").trim();
  const images = Array.isArray(product.images) ? product.images : [];
  const variants = Array.isArray(product.variants)
    ? product.variants.map((variant) => ({
        id: Number(variant.id),
        productId: Number(product.id),
        size: variant.size,
        color: variant.color,
        stock: Number(variant.stock || 0),
      }))
    : [];

  return {
    id: Number(product.id),
    name: product.name,
    shortDescription,
    description: product.description,
    basePrice: Number(product.price),
    price: Number(product.price),
    images,
    image: images[0] || "",
    category: product.category,
    genderType: product.genderType || "female",
    isOversize: Boolean(product.isOversize),
    status: product.status,
    discountPercent: Number(product.discountPercent || 0),
    isFreeShip: Boolean(product.isFreeShip),
    createdAt: new Date(product.createdAt).toISOString(),
    variants,
    reviews: Array.isArray(product.reviews) ? product.reviews.map(serializeReview) : [],
    totalStock: variants.reduce((sum, variant) => sum + variant.stock, 0),
  };
}

function serializeFomoItem(item) {
  return {
    id: Number(item.id),
    title: item.title,
    content: item.content,
    type: item.type,
    isActive: Boolean(item.isActive),
    createdAt: new Date(item.createdAt).toISOString(),
  };
}

function serializeVoucher(voucher) {
  return {
    id: Number(voucher.id),
    code: voucher.code,
    discountPercent: Number(voucher.discountPercent || 0),
    isActive: Boolean(voucher.isActive),
    maxUsage: Number(voucher.maxUsage || 0),
    usedCount: Number(voucher.usedCount || 0),
    createdAt: new Date(voucher.createdAt).toISOString(),
  };
}

function serializeOrderItem(item) {
  return {
    productId: Number(item.productId),
    variantId: Number(item.variantId),
    name: item.name,
    size: item.size,
    color: item.color,
    quantity: Number(item.quantity || 0),
    price: Number(item.price || 0),
    discountPercent: Number(item.discountPercent || 0),
    isFreeShip: Boolean(item.isFreeShip),
    image: item.image || "",
  };
}

function formatOrderSummary(items) {
  return items
    .map((item) => `${item.name} (${item.size}/${item.color}) x${item.quantity}`)
    .join(", ");
}

function formatAdminTotal(total, currency) {
  return `${currency} ${Number(total || 0).toLocaleString("en-US")}`;
}

function serializeOrder(order) {
  const items = Array.isArray(order.items) ? order.items.map(serializeOrderItem) : [];
  const currency = order.currency || defaultSettings.currency;

  return {
    id: Number(order.id),
    name: order.name,
    phone: order.phone,
    address: order.addressText || "",
    addressImage: order.addressImage || "",
    items,
    summary: formatOrderSummary(items),
    total: formatAdminTotal(order.total, currency),
    rawTotal: Number(order.total || 0),
    voucherCode: order.voucherCode || "",
    voucherDiscount: Number(order.voucherDiscount || 0),
    currency,
    time: new Date(order.createdAt).toISOString(),
  };
}

function normalizeVariants(variants) {
  if (!Array.isArray(variants) || variants.length === 0) {
    throw new Error("At least one variant is required.");
  }

  const seenKeys = new Set();

  return variants.map((variant) => {
    const size = String(variant.size || "").trim();
    const color = String(variant.color || "").trim();
    const stock = Number.parseInt(variant.stock, 10);

    if (!size || !color) {
      throw new Error("Each variant must include size and color.");
    }

    if (!Number.isInteger(stock) || stock < 0) {
      throw new Error("Variant stock must be a non-negative integer.");
    }

    const variantKey = buildVariantKey(size, color);
    if (seenKeys.has(variantKey)) {
      throw new Error("Duplicate size/color combinations are not allowed.");
    }
    seenKeys.add(variantKey);

    return {
      size,
      color,
      stock,
    };
  });
}

function normalizeProductInput(product) {
  const name = String(product.name || "").trim();
  const shortDescription = String(product.shortDescription || "").trim();
  const description = String(product.description || "").trim();
  const basePrice = Number(product.basePrice ?? product.price ?? 0);
  const category = product.category === "nam" ? "nam" : "nu";
  const status = product.status === "hidden" ? "hidden" : "active";
  const discountPercent = Number(product.discountPercent || 0);
  const isFreeShip = Boolean(product.isFreeShip);
  const imagesSource = Array.isArray(product.images)
    ? product.images
    : [product.image].filter(Boolean);
  const images = imagesSource.map((image) => String(image || "").trim()).filter(Boolean);
  const genderType = ["male", "female", "unisex"].includes(product.genderType)
    ? product.genderType
    : category === "nam"
      ? "male"
      : "female";
  const isOversize = Boolean(product.isOversize);

  if (!name || !shortDescription || !description) {
    throw new Error("Product name, short description, and description are required.");
  }

  if (shortDescription.length > 80) {
    throw new Error("Short description must be 80 characters or fewer.");
  }

  if (!Number.isFinite(basePrice) || basePrice <= 0) {
    throw new Error("Base price must be greater than zero.");
  }

  if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) {
    throw new Error("Discount percent must be between 0 and 100.");
  }

  if (images.length === 0) {
    throw new Error("At least one image is required.");
  }

  return {
    name,
    shortDescription,
    description,
    price: basePrice,
    category,
    genderType,
    isOversize,
    status,
    discountPercent,
    isFreeShip,
    images,
    variants: normalizeVariants(product.variants),
  };
}

function normalizeFomoInput(input) {
  const title = String(input.title || "").trim();
  const content = String(input.content || "").trim();
  const type = ["sales", "stock", "custom"].includes(input.type) ? input.type : "custom";
  const isActive = Boolean(input.isActive);

  if (!title || !content) {
    throw new Error("FOMO title and content are required.");
  }

  return {
    title,
    content,
    type,
    isActive,
  };
}

function normalizeVoucherInput(input) {
  const code = String(input.code || "").trim().toUpperCase();
  const discountPercent = Number(input.discountPercent || 0);
  const isActive = Boolean(input.isActive);
  const maxUsage = Number.parseInt(input.maxUsage, 10);

  if (!code) {
    throw new Error("Voucher code is required.");
  }

  if (!Number.isFinite(discountPercent) || discountPercent <= 0 || discountPercent > 100) {
    throw new Error("Voucher discount percent must be between 1 and 100.");
  }

  if (!Number.isInteger(maxUsage) || maxUsage < 0) {
    throw new Error("Voucher max usage must be a non-negative integer.");
  }

  return {
    code,
    discountPercent,
    isActive,
    maxUsage,
  };
}

function normalizeOrderItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error("Order must include at least one cart item.");
  }

  return rawItems.map((item) => {
    const productId = parseId(item.productId);
    const variantId = parseId(item.variantId);
    const quantity = Number.parseInt(item.quantity, 10);

    if (!productId || !variantId) {
      throw new Error("Invalid product variant selection.");
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error("Quantity must be at least 1.");
    }

    return {
      productId,
      variantId,
      quantity,
    };
  });
}

async function ensureSeedData() {
  if (!seedPromise) {
    seedPromise = (async () => {
      await connectToDatabase();
      await ensureDefaultSettings();

      if ((await Product.estimatedDocumentCount()) === 0) {
        const products = [];

        for (const item of seedProducts) {
          const productId = await getNextSequence("product");
          const variants = [];

          for (const variant of item.variants) {
            variants.push({
              id: await getNextSequence("variant"),
              size: variant.size,
              color: variant.color,
              stock: variant.stock,
            });
          }

          const reviews = [];
          for (const review of item.reviews || []) {
            reviews.push({
              id: await getNextSequence("review"),
              name: review.name,
              content: review.content,
              rating: review.rating || 5,
              createdAt: new Date(),
            });
          }

          products.push({
            id: productId,
            name: item.name,
            shortDescription: item.shortDescription || item.description,
            description: item.description,
            price: item.price,
            images: item.images,
            category: item.category,
            genderType: item.genderType,
            isOversize: false,
            status: item.status,
            discountPercent: Number(item.discountPercent || 0),
            isFreeShip: Boolean(item.isFreeShip),
            variants,
            reviews,
            createdAt: new Date(),
          });
        }

        if (products.length > 0) {
          await Product.insertMany(products, { ordered: true });
        }
      }

      if ((await Fomo.estimatedDocumentCount()) === 0) {
        const items = [];

        for (const item of seedFomoItems) {
          items.push({
            id: await getNextSequence("fomo"),
            title: item.title,
            content: item.content,
            type: item.type,
            isActive: Boolean(item.isActive),
            createdAt: new Date(),
          });
        }

        if (items.length > 0) {
          await Fomo.insertMany(items, { ordered: true });
        }
      }
    })().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }

  return seedPromise;
}

async function loadProducts({ activeOnly = false } = {}) {
  await ensureSeedData();
  const query = activeOnly ? { status: "active" } : {};
  const products = await Product.find(query).sort({ createdAt: -1, id: -1 }).lean();
  return products.map(serializeProduct);
}

export async function getActiveProducts() {
  return loadProducts({ activeOnly: true });
}

export async function getAllProducts() {
  return loadProducts({ activeOnly: false });
}

export async function getProductById(id) {
  const productId = parseId(id);

  if (!productId) {
    return null;
  }

  await ensureSeedData();
  const product = await Product.findOne({ id: productId }).lean();
  return product ? serializeProduct(product) : null;
}

export async function createProduct(productInput) {
  await ensureSeedData();
  const product = normalizeProductInput(productInput);
  const productId = await getNextSequence("product");

  const variants = [];
  for (const variant of product.variants) {
    variants.push({
      id: await getNextSequence("variant"),
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
    });
  }

  const created = await Product.create({
    id: productId,
    ...product,
    variants,
    reviews: [],
    createdAt: new Date(),
  });

  return serializeProduct(created.toObject());
}

export async function updateProduct(id, productInput) {
  const productId = parseId(id);

  if (!productId) {
    return null;
  }

  await ensureSeedData();
  const existing = await Product.findOne({ id: productId });
  if (!existing) {
    return null;
  }

  const product = normalizeProductInput(productInput);
  const existingVariantIds = new Map(
    (existing.variants || []).map((variant) => [buildVariantKey(variant.size, variant.color), variant.id]),
  );

  const variants = [];
  for (const variant of product.variants) {
    const variantKey = buildVariantKey(variant.size, variant.color);
    variants.push({
      id: existingVariantIds.get(variantKey) || (await getNextSequence("variant")),
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
    });
  }

  existing.name = product.name;
  existing.shortDescription = product.shortDescription;
  existing.description = product.description;
  existing.price = product.price;
  existing.images = product.images;
  existing.category = product.category;
  existing.genderType = product.genderType;
  existing.isOversize = product.isOversize;
  existing.status = product.status;
  existing.discountPercent = product.discountPercent;
  existing.isFreeShip = product.isFreeShip;
  existing.variants = variants;
  await existing.save();

  return serializeProduct(existing.toObject());
}

export async function deleteProduct(id) {
  const productId = parseId(id);
  if (!productId) {
    return { deletedCount: 0 };
  }

  await ensureSeedData();
  return Product.deleteOne({ id: productId });
}

export async function getSettings() {
  await ensureSeedData();
  const rows = await Setting.find({ key: { $in: Object.keys(settingDefaults) } }).lean();
  const mapped = Object.fromEntries(rows.map((row) => [row.key, row.value]));

  return {
    currency: mapped.currency || defaultSettings.currency,
    messengerUrl: mapped.messengerUrl || defaultSettings.messengerUrl,
    social: {
      facebook: mapped.socialFacebook || defaultSocialSettings.facebook,
      instagram: mapped.socialInstagram || defaultSocialSettings.instagram,
      tiktok: mapped.socialTiktok || defaultSocialSettings.tiktok,
    },
    mongodbConfigured: isMongoConfigured(),
    cloudinaryConfigured: isCloudinaryConfigured(),
  };
}

export async function updateSettings(partialSettings) {
  await ensureSeedData();
  const nextSettings = {
    currency: partialSettings.currency === "VND" ? "VND" : "TWD",
    messengerUrl: String(partialSettings.messengerUrl || defaultSettings.messengerUrl).trim(),
    socialFacebook: String(partialSettings.social?.facebook || "").trim(),
    socialInstagram: String(partialSettings.social?.instagram || "").trim(),
    socialTiktok: String(partialSettings.social?.tiktok || "").trim(),
  };

  await Setting.bulkWrite(
    Object.entries(nextSettings).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: { $set: { value } },
        upsert: true,
      },
    })),
    { ordered: false },
  );

  return getSettings();
}

export async function getGoogleSheetsSettings(options = {}) {
  await ensureSeedData();
  const row = await Setting.findOne({ key: GOOGLE_SHEETS_SETTING_KEY }).lean();
  return serializeGoogleSheetsSettings(row, options);
}

export async function updateGoogleSheetsSettings(partialSettings) {
  await ensureSeedData();
  const current = await Setting.findOne({ key: GOOGLE_SHEETS_SETTING_KEY }).lean();
  const nextPrivateKeyInput = String(partialSettings.privateKey || "");
  const nextPrivateKey =
    nextPrivateKeyInput.trim() && nextPrivateKeyInput !== "******"
      ? nextPrivateKeyInput.trim()
      : current?.privateKey || "";
  const nextSettings = {
    type: "googleSheets",
    clientEmail: String(partialSettings.clientEmail || "").trim(),
    privateKey: nextPrivateKey,
    sheetId: String(partialSettings.sheetId || "").trim(),
    enabled: Boolean(partialSettings.enabled),
  };

  if (
    nextSettings.enabled &&
    (!nextSettings.clientEmail || !nextSettings.privateKey || !nextSettings.sheetId)
  ) {
    throw new Error("Google Sheets config is incomplete.");
  }

  await Setting.updateOne(
    { key: GOOGLE_SHEETS_SETTING_KEY },
    {
      $set: {
        key: GOOGLE_SHEETS_SETTING_KEY,
        ...nextSettings,
      },
    },
    { upsert: true },
  );

  return getGoogleSheetsSettings();
}

export async function getActiveFomoItems() {
  await ensureSeedData();
  const items = await Fomo.find({ isActive: true }).sort({ createdAt: -1, id: -1 }).lean();
  return items.map(serializeFomoItem);
}

export async function getAllFomoItems() {
  await ensureSeedData();
  const items = await Fomo.find({}).sort({ createdAt: -1, id: -1 }).lean();
  return items.map(serializeFomoItem);
}

export async function createFomoItem(input) {
  await ensureSeedData();
  const item = normalizeFomoInput(input);
  const created = await Fomo.create({
    id: await getNextSequence("fomo"),
    ...item,
    createdAt: new Date(),
  });

  return serializeFomoItem(created.toObject());
}

export async function updateFomoItem(id, input) {
  const itemId = parseId(id);
  if (!itemId) {
    return null;
  }

  await ensureSeedData();
  const item = normalizeFomoInput(input);
  const updated = await Fomo.findOneAndUpdate({ id: itemId }, { $set: item }, { new: true }).lean();
  return updated ? serializeFomoItem(updated) : null;
}

export async function deleteFomoItem(id) {
  const itemId = parseId(id);
  if (!itemId) {
    return { deletedCount: 0 };
  }

  await ensureSeedData();
  return Fomo.deleteOne({ id: itemId });
}

export async function getAllVouchers() {
  await ensureSeedData();
  const vouchers = await Voucher.find({}).sort({ createdAt: -1, id: -1 }).lean();
  return vouchers.map(serializeVoucher);
}

export async function getVoucherById(id) {
  const voucherId = parseId(id);
  if (!voucherId) {
    return null;
  }

  await ensureSeedData();
  const voucher = await Voucher.findOne({ id: voucherId }).lean();
  return voucher ? serializeVoucher(voucher) : null;
}

export async function getVoucherByCode(code) {
  const normalizedCode = String(code || "").trim().toUpperCase();
  if (!normalizedCode) {
    return null;
  }

  await ensureSeedData();
  const voucher = await Voucher.findOne({ code: normalizedCode }).lean();
  return voucher ? serializeVoucher(voucher) : null;
}

export async function createVoucher(input) {
  await ensureSeedData();
  const voucher = normalizeVoucherInput(input);
  const existing = await Voucher.findOne({ code: voucher.code }).lean();

  if (existing) {
    throw new Error("Voucher code already exists.");
  }

  const created = await Voucher.create({
    id: await getNextSequence("voucher"),
    ...voucher,
    usedCount: 0,
    createdAt: new Date(),
  });

  return serializeVoucher(created.toObject());
}

export async function updateVoucher(id, input) {
  const voucherId = parseId(id);
  if (!voucherId) {
    return null;
  }

  await ensureSeedData();
  const voucher = normalizeVoucherInput(input);
  const duplicate = await Voucher.findOne({ code: voucher.code, id: { $ne: voucherId } }).lean();

  if (duplicate) {
    throw new Error("Voucher code already exists.");
  }

  const updated = await Voucher.findOneAndUpdate(
    { id: voucherId },
    { $set: voucher },
    { new: true },
  ).lean();

  return updated ? serializeVoucher(updated) : null;
}

export async function deleteVoucher(id) {
  const voucherId = parseId(id);
  if (!voucherId) {
    return { deletedCount: 0 };
  }

  await ensureSeedData();
  return Voucher.deleteOne({ id: voucherId });
}

export async function validateVoucher(code) {
  const voucher = await getVoucherByCode(code);

  if (!voucher) {
    throw new Error("VOUCHER_INVALID");
  }

  if (!voucher.isActive) {
    throw new Error("VOUCHER_INACTIVE");
  }

  if (voucher.maxUsage > 0 && voucher.usedCount >= voucher.maxUsage) {
    throw new Error("VOUCHER_EXCEEDED");
  }

  return voucher;
}

export async function incrementVoucherUsage(code) {
  const voucher = await validateVoucher(code);
  await Voucher.updateOne({ id: voucher.id }, { $inc: { usedCount: 1 } });
  return getVoucherById(voucher.id);
}

export async function reserveOrderItems(rawItems) {
  await ensureSeedData();
  const items = normalizeOrderItems(rawItems);
  const reservedItems = [];

  try {
    for (const item of items) {
      const product = await Product.findOne({
        id: item.productId,
        status: "active",
        "variants.id": item.variantId,
      }).lean();

      if (!product) {
        throw new Error("Selected variant no longer exists.");
      }

      const variant = (product.variants || []).find((candidate) => Number(candidate.id) === item.variantId);
      if (!variant) {
        throw new Error("Selected variant no longer exists.");
      }

      if (variant.stock < item.quantity) {
        throw new Error(
          `Only ${variant.stock} item(s) left for ${product.name} ${variant.size} / ${variant.color}.`,
        );
      }

      const updated = await Product.updateOne(
        {
          id: item.productId,
          status: "active",
          "variants.id": item.variantId,
          "variants.stock": { $gte: item.quantity },
        },
        {
          $inc: {
            "variants.$.stock": -item.quantity,
          },
        },
      );

      if (!updated.modifiedCount) {
        throw new Error("Unable to reserve stock for this variant.");
      }

      reservedItems.push({
        productId: Number(product.id),
        variantId: Number(variant.id),
        name: product.name,
        size: variant.size,
        color: variant.color,
        quantity: item.quantity,
        price: Number(product.price),
        discountPercent: Number(product.discountPercent || 0),
        isFreeShip: Boolean(product.isFreeShip),
        image: Array.isArray(product.images) ? product.images[0] || "" : "",
      });
    }

    return reservedItems;
  } catch (error) {
    await restoreReservedStock(reservedItems);
    throw error;
  }
}

export async function restoreReservedStock(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return;
  }

  await ensureSeedData();

  for (const item of items) {
    if (!item?.productId || !item?.variantId || !item?.quantity) {
      continue;
    }

    await Product.updateOne(
      {
        id: Number(item.productId),
        "variants.id": Number(item.variantId),
      },
      {
        $inc: {
          "variants.$.stock": Number(item.quantity),
        },
      },
    );
  }
}

export async function createOrder(input) {
  await ensureSeedData();
  const orderId = await getNextSequence("order");
  const settings = await getSettings();
  const items = Array.isArray(input.items) ? input.items.map(serializeOrderItem) : [];

  const created = await Order.create({
    id: orderId,
    name: String(input.name || "").trim(),
    phone: String(input.phone || "").trim(),
    addressText: String(input.addressText || "").trim(),
    addressImage: String(input.addressImage || "").trim(),
    items,
    total: Number(input.total || 0),
    currency: input.currency || settings.currency,
    voucherCode: String(input.voucherCode || "").trim().toUpperCase(),
    voucherDiscount: Number(input.voucherDiscount || 0),
    createdAt: new Date(),
  });

  return serializeOrder(created.toObject());
}

export async function getAllOrders() {
  await ensureSeedData();
  const orders = await Order.find({}).sort({ createdAt: -1, id: -1 }).lean();
  return orders.map(serializeOrder);
}

export async function deleteOrder(id) {
  const orderId = parseId(id);
  if (!orderId) {
    return { deletedCount: 0 };
  }

  await ensureSeedData();
  return Order.deleteOne({ id: orderId });
}
