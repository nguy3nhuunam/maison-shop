import mongoose from "mongoose";

const SOURCE_URL = "https://se77n.com/api/toolbox?kind=store&resource=products";
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not configured.");
}

const VariantSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    size: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    price: { type: Number, min: 0, default: null },
    images: { type: [String], default: [] },
  },
  {
    _id: false,
  },
);

const ProductSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    externalSourceId: { type: String, trim: true, default: "" },
    name: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
    category: { type: String, enum: ["nam", "nu"], required: true },
    tags: { type: [String], default: [] },
    genderType: {
      type: String,
      enum: ["male", "female", "unisex"],
      default: "female",
    },
    isOversize: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "hidden"], default: "active" },
    discountPercent: { type: Number, min: 0, max: 100, default: 0 },
    isFreeShip: { type: Boolean, default: false },
    variants: { type: [VariantSchema], default: [] },
    reviews: { type: [mongoose.Schema.Types.Mixed], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
  },
);

const CounterSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { versionKey: false },
);

const TagSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

const Product = mongoose.models.ImportProduct || mongoose.model("ImportProduct", ProductSchema, "products");
const Counter = mongoose.models.ImportCounter || mongoose.model("ImportCounter", CounterSchema, "counters");
const Tag = mongoose.models.ImportTag || mongoose.model("ImportTag", TagSchema, "tags");

function normalizeImages(images) {
  const source = Array.isArray(images) ? images : [images];
  return [...new Set(source.map((image) => String(image || "").trim()).filter(Boolean))];
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function makeShortDescription(product) {
  const source = normalizeText(product.subtitle || product.description || product.title || "");
  return source.length <= 80 ? source : `${source.slice(0, 77).trim()}...`;
}

function resolveCategory(product) {
  const genders = Array.isArray(product.genders) ? product.genders.map((value) => String(value).toLowerCase()) : [];
  return genders.includes("men") && !genders.includes("women") ? "nam" : "nu";
}

function resolveGenderType(product) {
  const genders = Array.isArray(product.genders) ? product.genders.map((value) => String(value).toLowerCase()) : [];
  if (genders.includes("men") && !genders.includes("women")) {
    return "male";
  }
  if (genders.includes("women") && !genders.includes("men")) {
    return "female";
  }
  return "unisex";
}

function parsePositiveNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : null;
}

function parseStock(value) {
  const numericValue = Number.parseInt(value, 10);
  return Number.isInteger(numericValue) && numericValue >= 0 ? numericValue : 0;
}

function buildSourceVariants(product) {
  const sourceVariants = Array.isArray(product.variants) && product.variants.length > 0
    ? product.variants
    : [
        {
          id: "default",
          name: "Mặc định",
          imageUrl: product.imageUrl || "",
          priceOverride: product.price,
          stockBySize: {
            [normalizeText(product.sizes?.[0]) || "Freesize"]: parseStock(product.totalStock),
          },
        },
      ];

  const fallbackSizes = Array.isArray(product.sizes)
    ? product.sizes.map((size) => normalizeText(size)).filter(Boolean)
    : [];
  const flattened = [];

  for (const sourceVariant of sourceVariants) {
    const optionLabel = normalizeText(sourceVariant.name || "Mặc định") || "Mặc định";
    const stockBySize = sourceVariant?.stockBySize && typeof sourceVariant.stockBySize === "object"
      ? sourceVariant.stockBySize
      : {};
    const sizeKeys = [...new Set([...fallbackSizes, ...Object.keys(stockBySize).map((size) => normalizeText(size))].filter(Boolean))];
    const normalizedSizes = sizeKeys.length > 0 ? sizeKeys : ["Freesize"];
    const variantImages = normalizeImages([
      sourceVariant.imageUrl,
      product.imageUrl,
      ...(Array.isArray(product.galleryImages) ? product.galleryImages : []),
    ]);
    const explicitPrice = parsePositiveNumber(sourceVariant.priceOverride) ?? parsePositiveNumber(product.price) ?? 0;

    for (const size of normalizedSizes) {
      flattened.push({
        size,
        color: optionLabel,
        stock: parseStock(stockBySize[size]),
        price: explicitPrice,
        images: variantImages,
      });
    }
  }

  return flattened;
}

function mapSourceProduct(sourceProduct) {
  const variants = buildSourceVariants(sourceProduct);
  const minVariantPrice = variants.reduce((lowest, variant) => {
    if (!variant.price) {
      return lowest;
    }
    return lowest > 0 ? Math.min(lowest, variant.price) : variant.price;
  }, 0);
  const basePrice = minVariantPrice || parsePositiveNumber(sourceProduct.minPrice) || parsePositiveNumber(sourceProduct.price);
  const images = normalizeImages([
    sourceProduct.imageUrl,
    ...(Array.isArray(sourceProduct.galleryImages) ? sourceProduct.galleryImages : []),
    ...variants.flatMap((variant) => variant.images),
  ]);

  if (!basePrice || images.length === 0 || variants.length === 0) {
    return null;
  }

  return {
    externalSourceId: normalizeText(sourceProduct.id),
    name: normalizeText(sourceProduct.title),
    shortDescription: makeShortDescription(sourceProduct),
    description: normalizeText(sourceProduct.description || sourceProduct.subtitle || sourceProduct.title),
    price: basePrice,
    images,
    category: resolveCategory(sourceProduct),
    tags: [resolveCategory(sourceProduct)],
    genderType: resolveGenderType(sourceProduct),
    isOversize: false,
    status: sourceProduct.active === false ? "hidden" : "active",
    discountPercent: Math.max(0, Number.parseInt(sourceProduct.discountPercent, 10) || 0),
    isFreeShip: Boolean(sourceProduct.freeship),
    variants,
  };
}

async function getNextSequence(key) {
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

async function ensureCategoryTags() {
  const existingTags = await Tag.find({ slug: { $in: ["nam", "nu"] } })
    .select({ slug: 1 })
    .lean();
  const existingSlugs = new Set(existingTags.map((tag) => tag.slug));
  const nextTags = [];

  if (!existingSlugs.has("nam")) {
    nextTags.push({
      id: await getNextSequence("tag"),
      name: "Nam",
      slug: "nam",
      isActive: true,
      createdAt: new Date(),
    });
  }

  if (!existingSlugs.has("nu")) {
    nextTags.push({
      id: await getNextSequence("tag"),
      name: "Nữ",
      slug: "nu",
      isActive: true,
      createdAt: new Date(),
    });
  }

  if (nextTags.length > 0) {
    await Tag.insertMany(nextTags, { ordered: true });
  }
}

async function upsertProduct(productInput) {
  const existing = await Product.findOne({ externalSourceId: productInput.externalSourceId });
  const variantIdByKey = new Map(
    (existing?.variants || []).map((variant) => [`${variant.size.toLowerCase()}::${variant.color.toLowerCase()}`, Number(variant.id)]),
  );

  const variants = [];
  for (const variant of productInput.variants) {
    const key = `${variant.size.toLowerCase()}::${variant.color.toLowerCase()}`;
    variants.push({
      id: variantIdByKey.get(key) || (await getNextSequence("variant")),
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
      price: variant.price,
      images: normalizeImages(variant.images),
    });
  }

  if (!existing) {
    const created = await Product.create({
      id: await getNextSequence("product"),
      ...productInput,
      variants,
      reviews: [],
      createdAt: new Date(),
    });
    return { type: "created", id: Number(created.id), name: created.name };
  }

  existing.name = productInput.name;
  existing.shortDescription = productInput.shortDescription;
  existing.description = productInput.description;
  existing.price = productInput.price;
  existing.images = productInput.images;
  existing.category = productInput.category;
  existing.tags = productInput.tags;
  existing.genderType = productInput.genderType;
  existing.isOversize = productInput.isOversize;
  existing.status = productInput.status;
  existing.discountPercent = productInput.discountPercent;
  existing.isFreeShip = productInput.isFreeShip;
  existing.variants = variants;
  await existing.save();

  return { type: "updated", id: Number(existing.id), name: existing.name };
}

async function fetchSourceProducts() {
  const response = await fetch(SOURCE_URL, {
    headers: {
      "User-Agent": "maisonshop-import/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch source products: ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data.products) ? data.products : [];
}

async function main() {
  await mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
  });

  try {
    const sourceProducts = await fetchSourceProducts();
    await ensureCategoryTags();

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const sourceProduct of sourceProducts) {
      const mappedProduct = mapSourceProduct(sourceProduct);

      if (!mappedProduct || !mappedProduct.externalSourceId || !mappedProduct.name) {
        skippedCount += 1;
        continue;
      }

      const result = await upsertProduct(mappedProduct);
      if (result.type === "created") {
        createdCount += 1;
      } else {
        updatedCount += 1;
      }
    }

    console.log(
      JSON.stringify(
        {
          sourceCount: sourceProducts.length,
          createdCount,
          updatedCount,
          skippedCount,
        },
        null,
        2,
      ),
    );
  } finally {
    await mongoose.disconnect();
  }
}

await main();
