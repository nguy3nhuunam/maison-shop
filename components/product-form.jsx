"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-client";
import { useTranslation } from "@/lib/use-translation";

const presetSizes = ["S", "M", "L", "XL"];

let nextVariantKey = 0;
let nextColorBlockKey = 0;

function normalizeImages(images) {
  const source = Array.isArray(images) ? images : [images];
  return [...new Set(source.map((image) => String(image || "").trim()).filter(Boolean))];
}

function normalizeColorKey(color) {
  return String(color || "").trim().toLowerCase();
}

function createEmptyVariant() {
  return {
    clientKey: `variant-${nextVariantKey++}`,
    size: "",
    color: "",
    stock: 0,
  };
}

function createEmptyColorBlock() {
  return {
    clientKey: `color-${nextColorBlockKey++}`,
    color: "",
    images: [],
  };
}

function buildColorBlocks(product) {
  if (!product?.variants?.length) {
    return [createEmptyColorBlock()];
  }

  const blocks = [];
  const seen = new Set();

  for (const variant of product.variants) {
    const color = String(variant.color || "").trim();
    const colorKey = normalizeColorKey(color);

    if (!color || seen.has(colorKey)) {
      continue;
    }

    seen.add(colorKey);
    blocks.push({
      clientKey: `color-${nextColorBlockKey++}`,
      color,
      images: normalizeImages(variant.images?.length ? variant.images : product.images),
    });
  }

  return blocks.length > 0 ? blocks : [createEmptyColorBlock()];
}

async function uploadAdminFile(file) {
  const uploadData = new FormData();
  uploadData.append("file", file);

  const uploaded = await adminFetch("/api/upload", {
    method: "POST",
    body: uploadData,
  });

  return uploaded.url;
}

export default function ProductForm({ product }) {
  const router = useRouter();
  const { t } = useTranslation();
  const presetColors = useMemo(
    () => [
      { label: t("promotionColorBlack"), value: t("promotionColorBlack") },
      { label: t("promotionColorBeige"), value: t("promotionColorBeige") },
    ],
    [t],
  );
  const initialState = useMemo(
    () => ({
      name: "",
      shortDescription: "",
      basePrice: "",
      discountPercent: "",
      isFreeShip: false,
      category: "nu",
      tags: [],
      status: "active",
      description: "",
      primaryImage: "",
      variants: [createEmptyVariant()],
      colorBlocks: [createEmptyColorBlock()],
    }),
    [],
  );

  const [form, setForm] = useState(
    product
      ? {
          name: product.name,
          shortDescription: product.shortDescription || "",
          basePrice: String(product.basePrice),
          discountPercent: product.discountPercent ? String(product.discountPercent) : "",
          isFreeShip: Boolean(product.isFreeShip),
          category: product.category,
          tags: Array.isArray(product.tags) ? product.tags : [],
          status: product.status,
          description: product.description,
          primaryImage: product.images?.[0] || product.image || "",
          variants:
            product.variants?.map((variant) => ({
              clientKey: `variant-${nextVariantKey++}`,
              size: variant.size,
              color: variant.color,
              stock: Number(variant.stock || 0),
            })) || [createEmptyVariant()],
          colorBlocks: buildColorBlocks(product),
        }
      : initialState,
  );
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(product?.images?.[0] || product?.image || "");
  const [availableTags, setAvailableTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingColorKey, setUploadingColorKey] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl(form.primaryImage || form.colorBlocks[0]?.images?.[0] || "");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file, form.primaryImage, form.colorBlocks]);

  useEffect(() => {
    async function loadTags() {
      try {
        const data = await adminFetch("/api/tags?includeAll=true");
        setAvailableTags(data.tags || []);
      } catch (loadError) {
        setError(loadError.message || t("productTagsLoadError"));
      } finally {
        setTagsLoading(false);
      }
    }

    loadTags();
  }, [t]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleTag(tagSlug) {
    setForm((current) => {
      const selectedTags = Array.isArray(current.tags) ? current.tags : [];

      return {
        ...current,
        tags: selectedTags.includes(tagSlug)
          ? selectedTags.filter((value) => value !== tagSlug)
          : [...selectedTags, tagSlug],
      };
    });
  }

  function updateVariant(index, field, value) {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, [field]: value } : variant,
      ),
    }));
  }

  function addVariantRow(preset = {}) {
    setForm((current) => ({
      ...current,
      variants: [...current.variants, { ...createEmptyVariant(), ...preset }],
    }));
  }

  function removeVariantRow(index) {
    setForm((current) => ({
      ...current,
      variants:
        current.variants.length === 1
          ? [createEmptyVariant()]
          : current.variants.filter((_, variantIndex) => variantIndex !== index),
    }));
  }

  function updateColorBlock(index, field, value) {
    setForm((current) => {
      if (field !== "color") {
        return {
          ...current,
          colorBlocks: current.colorBlocks.map((block, blockIndex) =>
            blockIndex === index ? { ...block, [field]: value } : block,
          ),
        };
      }

      const previousColor = String(current.colorBlocks[index]?.color || "").trim();
      const nextColor = String(value || "");

      return {
        ...current,
        colorBlocks: current.colorBlocks.map((block, blockIndex) =>
          blockIndex === index ? { ...block, color: nextColor } : block,
        ),
        variants: current.variants.map((variant) =>
          previousColor && String(variant.color || "").trim() === previousColor
            ? { ...variant, color: nextColor }
            : variant,
        ),
      };
    });
  }

  function addColorBlock(preset = {}) {
    setForm((current) => ({
      ...current,
      colorBlocks: [...current.colorBlocks, { ...createEmptyColorBlock(), ...preset }],
    }));
  }

  function removeColorBlock(index) {
    setForm((current) => ({
      ...current,
      colorBlocks:
        current.colorBlocks.length === 1
          ? [createEmptyColorBlock()]
          : current.colorBlocks.filter((_, blockIndex) => blockIndex !== index),
    }));
  }

  function removeColorImage(colorIndex, imageIndex) {
    setForm((current) => ({
      ...current,
      colorBlocks: current.colorBlocks.map((block, blockIndex) =>
        blockIndex === colorIndex
          ? {
              ...block,
              images: block.images.filter((_, currentImageIndex) => currentImageIndex !== imageIndex),
            }
          : block,
      ),
    }));
  }

  async function handleColorUpload(index, fileList) {
    const files = Array.from(fileList || []);
    if (files.length === 0) {
      return;
    }

    const targetKey = form.colorBlocks[index]?.clientKey || "";
    setUploadingColorKey(targetKey);
    setError("");

    try {
      const uploadedUrls = await Promise.all(files.map((currentFile) => uploadAdminFile(currentFile)));

      setForm((current) => {
        const nextColorBlocks = current.colorBlocks.map((block, blockIndex) =>
          blockIndex === index
            ? { ...block, images: normalizeImages([...(block.images || []), ...uploadedUrls]) }
            : block,
        );

        const nextPrimaryImage = current.primaryImage || uploadedUrls[0] || "";

        return {
          ...current,
          primaryImage: nextPrimaryImage,
          colorBlocks: nextColorBlocks,
        };
      });
    } catch (uploadError) {
      setError(uploadError.message || t("productSaveError"));
    } finally {
      setUploadingColorKey("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      let coverImageUrl = form.primaryImage;

      if (file) {
        coverImageUrl = await uploadAdminFile(file);
      }

      const cleanedColorBlocks = form.colorBlocks
        .map((block) => ({
          color: String(block.color || "").trim(),
          images: normalizeImages(block.images),
        }))
        .filter((block) => block.color || block.images.length > 0);

      const seenColorKeys = new Set();
      for (const block of cleanedColorBlocks) {
        const colorKey = normalizeColorKey(block.color);
        if (!block.color) {
          throw new Error(t("productColorNameRequired"));
        }
        if (seenColorKeys.has(colorKey)) {
          throw new Error(t("productColorDuplicate"));
        }
        seenColorKeys.add(colorKey);
      }

      const cleanedVariants = form.variants.map((variant) => ({
        size: String(variant.size || "").trim(),
        color: String(variant.color || "").trim(),
        stock: Number.parseInt(variant.stock, 10),
      }));

      if (cleanedVariants.length === 0) {
        throw new Error(t("productVariantRequired"));
      }

      if (cleanedVariants.some((variant) => !variant.size || !variant.color)) {
        throw new Error(t("productVariantIncomplete"));
      }

      const colorImagesByKey = new Map(
        cleanedColorBlocks.map((block) => [normalizeColorKey(block.color), block.images]),
      );
      const variantsWithImages = cleanedVariants.map((variant) => ({
        ...variant,
        images: colorImagesByKey.get(normalizeColorKey(variant.color)) || [],
      }));

      const galleryImages = normalizeImages([
        coverImageUrl,
        ...cleanedColorBlocks.flatMap((block) => block.images),
        ...variantsWithImages.flatMap((variant) => variant.images),
      ]);

      if (galleryImages.length === 0) {
        throw new Error(t("productImageRequired"));
      }

      const primaryImage = coverImageUrl || galleryImages[0] || "";
      const payload = {
        name: form.name,
        shortDescription: form.shortDescription,
        description: form.description,
        basePrice: Number(form.basePrice),
        discountPercent: Number(form.discountPercent || 0),
        isFreeShip: Boolean(form.isFreeShip),
        images: normalizeImages([primaryImage, ...galleryImages]),
        category: form.category,
        tags: form.tags,
        status: form.status,
        variants: variantsWithImages,
      };

      if (product?.id) {
        await adminFetch(`/api/products/${product.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await adminFetch("/api/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      router.push("/admin/products");
      router.refresh();
    } catch (submitError) {
      setError(submitError.message || t("productSaveError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="luxury-card space-y-8 rounded-[32px] p-6 md:space-y-9 md:p-8">
      <div className="grid gap-x-6 gap-y-6 md:grid-cols-2">
        <label className="space-y-3 text-sm text-stone-600">
          <span>{t("productFieldName")}</span>
          <input
            required
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="min-h-14 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
          />
        </label>

        <label className="space-y-3 text-sm text-stone-600">
          <span>{t("productFieldPrice")}</span>
          <input
            required
            min="0"
            type="number"
            value={form.basePrice}
            onChange={(event) => updateField("basePrice", event.target.value)}
            className="min-h-14 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
          />
        </label>

        <label className="space-y-3 text-sm text-stone-600">
          <span>{t("productFieldCategory")}</span>
          <select
            value={form.category}
            onChange={(event) => updateField("category", event.target.value)}
            className="min-h-14 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
          >
            <option value="nam">{t("categoryNam")}</option>
            <option value="nu">{t("categoryNu")}</option>
          </select>
        </label>

        <label className="space-y-3 text-sm text-stone-600">
          <span>{t("productFieldStatus")}</span>
          <select
            value={form.status}
            onChange={(event) => updateField("status", event.target.value)}
            className="min-h-14 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
          >
            <option value="active">{t("statusActive")}</option>
            <option value="hidden">{t("statusHidden")}</option>
          </select>
        </label>
      </div>

      <label className="space-y-3 text-sm text-stone-600">
        <div className="flex items-center justify-between gap-3">
          <span>{t("productFieldShortDescription")}</span>
          <span className="text-xs leading-none text-stone-400">{form.shortDescription.length}/80</span>
        </div>
        <input
          required
          maxLength={80}
          value={form.shortDescription}
          onChange={(event) => updateField("shortDescription", event.target.value)}
          className="min-h-14 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
        />
      </label>

      <section className="mt-2 rounded-[28px] border border-stone-200 bg-white p-5 md:mt-3">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-stone-900">{t("productTagsTitle")}</h2>
          <p className="text-sm text-stone-500">{t("productTagsDescription")}</p>
        </div>

        {tagsLoading ? <p className="mt-4 text-sm text-stone-500">{t("productTagsLoading")}</p> : null}

        {!tagsLoading && availableTags.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-3">
            {availableTags.map((tag) => {
              const active = form.tags.includes(tag.slug);

              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.slug)}
                  className={`rounded-full border px-4 py-3 text-sm transition ${
                    active
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-200 bg-[#fcfaf6] text-stone-700"
                  }`}
                >
                  <span>{tag.name}</span>
                  <span className={`ml-2 text-xs ${active ? "text-white/80" : "text-stone-400"}`}>
                    /{tag.slug}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        {!tagsLoading && availableTags.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-[#fcfaf6] px-4 py-5 text-sm text-stone-400">
            {t("productTagsEmpty")}
          </div>
        ) : null}
      </section>

      <section className="mt-3 rounded-[28px] border border-stone-200 bg-white p-5 md:mt-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">{t("promotionTitle")}</h2>
            <p className="mt-1 text-sm text-stone-500">{t("productsAllDescription")}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-x-6 gap-y-5 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.95fr)] md:items-end">
          <label className="space-y-3 text-sm text-stone-600">
            <span>{t("discountPercent")}</span>
            <input
              min="0"
              max="100"
              type="number"
              value={form.discountPercent}
              onChange={(event) => updateField("discountPercent", event.target.value)}
              className="min-h-14 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
              placeholder="10"
            />
          </label>

          <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-stone-200 bg-[#fcfaf6] px-4 py-4 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={form.isFreeShip}
              onChange={(event) => updateField("isFreeShip", event.target.checked)}
            />
            {t("freeShipToggle")}
          </label>
        </div>
      </section>

      <label className="space-y-3 text-sm text-stone-600">
        <span>{t("productFieldDescription")}</span>
        <textarea
          required
          rows={5}
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          className="min-h-[160px] w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 leading-7"
        />
      </label>

      <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-[28px] border border-stone-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-stone-900">{t("productCoverImageTitle")}</h2>
            <p className="mt-1 text-sm text-stone-500">{t("productCoverImageDescription")}</p>

            <div className="mt-5 space-y-4">
              <label className="space-y-2 text-sm text-stone-600">
                <span>{t("productFieldImageUploadCloudinary")}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                  className="w-full rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-3"
                />
              </label>

              <label className="space-y-2 text-sm text-stone-600">
                <span>{t("productFieldImageUrl")}</span>
                <input
                  value={form.primaryImage}
                  onChange={(event) => updateField("primaryImage", event.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
                />
              </label>
            </div>
          </div>

          <section className="rounded-[28px] border border-stone-200 bg-white p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-stone-900">{t("productColorImagesTitle")}</h2>
                <p className="mt-1 text-sm text-stone-500">{t("productColorImagesDescription")}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {presetColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => addColorBlock({ color: color.value, images: [] })}
                    className="rounded-full border border-stone-300 px-3 py-2 text-xs font-medium text-stone-600"
                  >
                    + {color.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => addColorBlock()}
                  className="rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold text-white"
                >
                  {t("productColorAdd")}
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {form.colorBlocks.map((block, index) => {
                const isUploading = uploadingColorKey === block.clientKey;

                return (
                  <div key={block.clientKey} className="rounded-3xl border border-stone-200 bg-[#fcfaf6] p-4">
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                      <label className="space-y-2 text-sm text-stone-600">
                        <span>{t("productVariantColor")}</span>
                        <input
                          value={block.color}
                          onChange={(event) => updateColorBlock(index, "color", event.target.value)}
                          className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
                          placeholder={t("productColorNamePlaceholder")}
                        />
                      </label>

                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => removeColorBlock(index)}
                          className="rounded-full border border-red-200 px-4 py-3 text-sm text-red-500"
                        >
                          {t("commonDelete")}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 rounded-[24px] border border-dashed border-stone-300 bg-white p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-medium text-stone-800">{t("productColorImagesUpload")}</p>
                          <p className="mt-1 text-xs leading-6 text-stone-400">{t("productColorImagesHint")}</p>
                        </div>

                        <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#b38a45]">
                          <span>
                            {isUploading ? t("productColorImagesUploading") : t("productFieldImageUploadCloudinary")}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            disabled={isUploading}
                            onChange={async (event) => {
                              await handleColorUpload(index, event.target.files);
                              event.target.value = "";
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {block.images.length > 0 ? (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {block.images.map((image, imageIndex) => (
                            <div key={`${block.clientKey}-${image}`} className="rounded-[22px] border border-stone-200 bg-[#fcfaf6] p-3">
                              <img
                                src={image}
                                alt={block.color || `${t("productVariantColor")} ${imageIndex + 1}`}
                                className="aspect-[4/5] w-full rounded-2xl object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeColorImage(index, imageIndex)}
                                className="mt-3 w-full rounded-full border border-red-200 px-3 py-2 text-sm text-red-500"
                              >
                                {t("commonDelete")}
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-4 rounded-2xl bg-[#fcfaf6] px-4 py-5 text-sm text-stone-400">
                          {t("productColorImagesEmpty")}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="rounded-[28px] border border-stone-200 bg-white p-4">
          <p className="text-sm font-medium text-stone-600">{t("productPreview")}</p>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={form.name || t("productPreview")}
              className="mt-3 aspect-[4/5] w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="mt-3 flex aspect-[4/5] items-center justify-center rounded-2xl bg-stone-100 text-sm text-stone-400">
              {t("productPreviewEmpty")}
            </div>
          )}

          <div className="mt-4 space-y-2 rounded-2xl bg-[#fcfaf6] p-4 text-sm text-stone-500">
            <p>{t("productCoverPreviewHint")}</p>
            <p>{t("productColorPreviewHint")}</p>
          </div>
        </div>
      </div>

      <section className="rounded-[28px] border border-stone-200 bg-white p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">{t("productVariants")}</h2>
            <p className="mt-1 text-sm text-stone-500">{t("productVariantsDescription")}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {presetSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => addVariantRow({ size, color: "", stock: 0 })}
                className="rounded-full border border-stone-300 px-3 py-2 text-xs font-medium text-stone-600"
              >
                + {size}
              </button>
            ))}
            {presetColors.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => addVariantRow({ size: "", color: color.value, stock: 0 })}
                className="rounded-full border border-stone-300 px-3 py-2 text-xs font-medium text-stone-600"
              >
                + {color.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => addVariantRow()}
              className="rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold text-white"
            >
              {t("productAddRow")}
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div className="hidden grid-cols-[1fr_1fr_120px_80px] gap-3 px-2 text-xs uppercase tracking-[0.2em] text-stone-400 md:grid">
            <span>{t("productVariantSize")}</span>
            <span>{t("productVariantColor")}</span>
            <span>{t("productVariantStock")}</span>
            <span className="text-right">{t("productAction")}</span>
          </div>

          {form.variants.map((variant, index) => (
            <div
              key={variant.clientKey}
              className="grid gap-3 rounded-3xl border border-stone-200 bg-[#fcfaf6] p-4 md:grid-cols-[1fr_1fr_120px_80px]"
            >
              <label className="space-y-2 text-sm text-stone-600">
                <span className="md:hidden">{t("productVariantSize")}</span>
                <input
                  value={variant.size}
                  onChange={(event) => updateVariant(index, "size", event.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
                  placeholder="M"
                />
              </label>

              <label className="space-y-2 text-sm text-stone-600">
                <span className="md:hidden">{t("productVariantColor")}</span>
                <input
                  value={variant.color}
                  onChange={(event) => updateVariant(index, "color", event.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
                />
              </label>

              <label className="space-y-2 text-sm text-stone-600">
                <span className="md:hidden">{t("productVariantStock")}</span>
                <input
                  min="0"
                  type="number"
                  value={variant.stock}
                  onChange={(event) => updateVariant(index, "stock", event.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
                />
              </label>

              <div className="flex items-end justify-end">
                <button
                  type="button"
                  onClick={() => removeVariantRow(index)}
                  className="rounded-full border border-red-200 px-4 py-3 text-sm text-red-500"
                >
                  {t("commonDelete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={submitting || Boolean(uploadingColorKey)}
          className="rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#b38a45] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? t("productSaving")
            : product
              ? t("productSaveUpdate")
              : t("productSaveCreate")}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-full border border-stone-300 px-6 py-3 text-sm text-stone-600"
        >
          {t("productBack")}
        </button>
      </div>
    </form>
  );
}
