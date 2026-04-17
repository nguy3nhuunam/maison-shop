"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-client";
import { useTranslation } from "@/lib/use-translation";

const presetSizes = ["S", "M", "L", "XL"];

function createEmptyVariant() {
  return {
    size: "",
    color: "",
    stock: 0,
  };
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
      status: "active",
      description: "",
      primaryImage: "",
      variants: [createEmptyVariant()],
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
          status: product.status,
          description: product.description,
          primaryImage: product.images?.[0] || product.image || "",
          variants:
            product.variants?.map((variant) => ({
              size: variant.size,
              color: variant.color,
              stock: Number(variant.stock || 0),
            })) || [createEmptyVariant()],
        }
      : initialState,
  );
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(product?.images?.[0] || product?.image || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl(form.primaryImage || "");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file, form.primaryImage]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
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

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      let imageUrl = form.primaryImage;

      if (file) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        const uploaded = await adminFetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });
        imageUrl = uploaded.url;
      }

      if (!imageUrl) {
        throw new Error(t("productImageRequired"));
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

      const payload = {
        name: form.name,
        shortDescription: form.shortDescription,
        description: form.description,
        basePrice: Number(form.basePrice),
        discountPercent: Number(form.discountPercent || 0),
        isFreeShip: Boolean(form.isFreeShip),
        images: [imageUrl],
        category: form.category,
        status: form.status,
        variants: cleanedVariants,
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

      <section className="mt-3 rounded-[28px] border border-stone-200 bg-white p-5 md:mt-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">{t("promotionTitle")}</h2>
            <p className="mt-1 text-sm text-stone-500">
              {t("productsAllDescription")}
            </p>
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
              key={`${index}-${variant.size}-${variant.color}`}
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
          disabled={submitting}
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
