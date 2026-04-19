"use client";

import { useEffect, useState } from "react";
import AddressImageInput from "@/components/address-image-input";
import AdminShell from "@/components/admin-shell";
import { adminFetch } from "@/lib/admin-client";
import { defaultHomepageContent, sanitizeHomepageContent } from "@/lib/homepage-config";

const initialState = {
  currency: "TWD",
  messengerUrl: "https://m.me/yourpage",
  social: {
    facebook: "",
    instagram: "",
    tiktok: "",
  },
  homepage: sanitizeHomepageContent(defaultHomepageContent),
};

const sectionTypeOptions = [
  { value: "newest", label: "Sản phẩm mới nhất" },
  { value: "sale", label: "Sản phẩm đang giảm giá" },
  { value: "tag", label: "Theo tag" },
];

const campaignTypeOptions = [
  { value: "", label: "Không gắn CTA" },
  { value: "tag", label: "Đi tới tag" },
  { value: "url", label: "Đi tới URL" },
];

export default function AdminConfigPage() {
  const [form, setForm] = useState(initialState);
  const [tags, setTags] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadConfig() {
      try {
        const [configData, tagsData, vouchersData] = await Promise.all([
          adminFetch("/api/config"),
          adminFetch("/api/tags?includeAll=true"),
          adminFetch("/api/vouchers"),
        ]);

        setForm({
          ...initialState,
          ...configData.settings,
          social: {
            ...initialState.social,
            ...configData.settings?.social,
          },
          homepage: sanitizeHomepageContent(configData.settings?.homepage),
        });
        setTags(Array.isArray(tagsData.tags) ? tagsData.tags : []);
        setVouchers(Array.isArray(vouchersData.vouchers) ? vouchersData.vouchers : []);
      } catch (error) {
        setMessage(error.message || "Không tải được cấu hình.");
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, []);

  function updateSocialField(field, value) {
    setForm((current) => ({
      ...current,
      social: {
        ...(current.social || initialState.social),
        [field]: value,
      },
    }));
  }

  function updateHeroField(field, value) {
    setForm((current) => ({
      ...current,
      homepage: {
        ...current.homepage,
        hero: {
          ...current.homepage.hero,
          [field]: value,
        },
      },
    }));
  }

  function updateHomepageSection(index, field, value) {
    setForm((current) => ({
      ...current,
      homepage: {
        ...current.homepage,
        sections: current.homepage.sections.map((section, sectionIndex) =>
          sectionIndex === index ? { ...section, [field]: value } : section,
        ),
      },
    }));
  }

  function updateCampaignField(campaignKey, field, value) {
    setForm((current) => ({
      ...current,
      homepage: {
        ...current.homepage,
        [campaignKey]: {
          ...current.homepage[campaignKey],
          [field]: value,
        },
      },
    }));
  }

  async function handleHeroImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const validTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setMessage("Hero banner chỉ hỗ trợ PNG, JPG hoặc WEBP.");
      event.target.value = "";
      return;
    }

    const payload = new FormData();
    payload.append("file", file);

    setUploadingHero(true);
    setMessage("");

    try {
      const uploaded = await adminFetch("/api/upload", {
        method: "POST",
        body: payload,
      });
      updateHeroField("imageUrl", uploaded.secure_url || uploaded.url || "");
      if (!form.homepage.hero.imageAlt) {
        updateHeroField("imageAlt", file.name.replace(/\.[^.]+$/, ""));
      }
    } catch (error) {
      setMessage(error.message || "Không upload được hero banner.");
    } finally {
      setUploadingHero(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const payload = {
        ...form,
        homepage: sanitizeHomepageContent(form.homepage),
      };
      const data = await adminFetch("/api/config", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setForm((current) => ({
        ...current,
        ...data.settings,
        homepage: sanitizeHomepageContent(data.settings?.homepage),
      }));
      setMessage("Đã lưu cấu hình homepage và campaign.");
    } catch (error) {
      setMessage(error.message || "Không lưu được cấu hình.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell
      title="Cấu hình storefront"
      description="Quản lý hero banner, block sản phẩm trên homepage và campaign theo lịch chạy."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {loading ? (
          <div className="luxury-card rounded-[32px] p-6 text-sm text-stone-500">
            Đang tải cấu hình...
          </div>
        ) : null}

        {!loading ? (
          <>
            <section className="luxury-card space-y-5 rounded-[32px] p-6">
              <div>
                <h3 className="text-xl font-bold text-stone-900">Cấu hình chung</h3>
                <p className="mt-2 text-sm text-stone-500">
                  Các thiết lập dùng chung cho storefront và kênh liên hệ.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <SelectField
                  label="Tiền tệ mặc định"
                  value={form.currency}
                  onChange={(value) => setForm((current) => ({ ...current, currency: value }))}
                  options={[
                    { value: "TWD", label: "TWD" },
                    { value: "VND", label: "VND" },
                  ]}
                />

                <TextField
                  label="Link Messenger"
                  value={form.messengerUrl}
                  onChange={(value) => setForm((current) => ({ ...current, messengerUrl: value }))}
                  placeholder="https://m.me/yourpage"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <TextField
                  label="Facebook"
                  value={form.social?.facebook || ""}
                  onChange={(value) => updateSocialField("facebook", value)}
                  placeholder="https://facebook.com/..."
                />
                <TextField
                  label="Instagram"
                  value={form.social?.instagram || ""}
                  onChange={(value) => updateSocialField("instagram", value)}
                  placeholder="https://instagram.com/..."
                />
                <TextField
                  label="TikTok"
                  value={form.social?.tiktok || ""}
                  onChange={(value) => updateSocialField("tiktok", value)}
                  placeholder="https://tiktok.com/@..."
                />
              </div>
            </section>

            <section className="luxury-card space-y-5 rounded-[32px] p-6">
              <div>
                <h3 className="text-xl font-bold text-stone-900">Hero banner</h3>
                <p className="mt-2 text-sm text-stone-500">
                  Chỉnh nội dung nổi bật đầu trang và ảnh campaign của homepage.
                </p>
              </div>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                <div className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <TextField
                      label="Eyebrow tiếng Việt"
                      value={form.homepage.hero.eyebrowVi}
                      onChange={(value) => updateHeroField("eyebrowVi", value)}
                    />
                    <TextField
                      label="Eyebrow tiếng Hoa"
                      value={form.homepage.hero.eyebrowZh}
                      onChange={(value) => updateHeroField("eyebrowZh", value)}
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <TextField
                      label="Tiêu đề tiếng Việt"
                      value={form.homepage.hero.titleVi}
                      onChange={(value) => updateHeroField("titleVi", value)}
                    />
                    <TextField
                      label="Tiêu đề tiếng Hoa"
                      value={form.homepage.hero.titleZh}
                      onChange={(value) => updateHeroField("titleZh", value)}
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <TextareaField
                      label="Mô tả tiếng Việt"
                      value={form.homepage.hero.subtitleVi}
                      onChange={(value) => updateHeroField("subtitleVi", value)}
                      rows={4}
                    />
                    <TextareaField
                      label="Mô tả tiếng Hoa"
                      value={form.homepage.hero.subtitleZh}
                      onChange={(value) => updateHeroField("subtitleZh", value)}
                      rows={4}
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <TextField
                      label="URL ảnh hero"
                      value={form.homepage.hero.imageUrl}
                      onChange={(value) => updateHeroField("imageUrl", value)}
                      placeholder="https://..."
                    />
                    <TextField
                      label="Alt ảnh"
                      value={form.homepage.hero.imageAlt}
                      onChange={(value) => updateHeroField("imageAlt", value)}
                      placeholder="MAISON hero campaign"
                    />
                  </div>
                </div>

                <div className="space-y-4 rounded-[28px] border border-stone-200 bg-white p-5">
                  <AddressImageInput
                    label="Ảnh hero banner"
                    uploadTitle={uploadingHero ? "Đang tải ảnh..." : "Tải ảnh hero"}
                    uploadHelper="PNG, JPG, WEBP. Ảnh nên có bố cục ngang hoặc dọc rõ ràng."
                    uploadedStatus="Ảnh này sẽ hiển thị ở cột campaign bên phải hero."
                    replaceLabel="Đổi ảnh"
                    removeLabel="Xóa ảnh"
                    previewUrl={form.homepage.hero.imageUrl}
                    fileName={form.homepage.hero.imageAlt || "hero-banner"}
                    onFileChange={handleHeroImageChange}
                    onRemove={() => updateHeroField("imageUrl", "")}
                  />

                  <div className="rounded-[24px] border border-dashed border-stone-200 bg-[#fcfaf6] p-4">
                    <p className="text-sm font-semibold text-stone-900">Preview nhanh</p>
                    <p className="mt-2 text-xs leading-5 text-stone-500">
                      Nếu không có ảnh, storefront sẽ chỉ hiển thị card filter như hiện tại.
                    </p>
                    {form.homepage.hero.imageUrl ? (
                      <img
                        src={form.homepage.hero.imageUrl}
                        alt={form.homepage.hero.imageAlt || "Hero preview"}
                        className="mt-4 aspect-[4/5] w-full rounded-[20px] object-cover"
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            <section className="luxury-card space-y-5 rounded-[32px] p-6">
              <div>
                <h3 className="text-xl font-bold text-stone-900">Block sản phẩm homepage</h3>
                <p className="mt-2 text-sm text-stone-500">
                  Chọn nguồn dữ liệu cho các block “Mới về”, “Sale”, “Bán chạy”.
                </p>
              </div>

              <div className="space-y-5">
                {form.homepage.sections.map((section, index) => (
                  <SectionEditor
                    key={section.key}
                    section={section}
                    tags={tags}
                    onChange={(field, value) => updateHomepageSection(index, field, value)}
                  />
                ))}
              </div>
            </section>

            <section className="luxury-card space-y-5 rounded-[32px] p-6">
              <div>
                <h3 className="text-xl font-bold text-stone-900">Announcement bar</h3>
                <p className="mt-2 text-sm text-stone-500">
                  Thanh thông báo chỉ hiện trên homepage khi đang trong thời gian campaign.
                </p>
              </div>

              <CampaignEditor
                campaign={form.homepage.announcementBar}
                tags={tags}
                vouchers={vouchers}
                onChange={(field, value) => updateCampaignField("announcementBar", field, value)}
              />
            </section>

            <section className="luxury-card space-y-5 rounded-[32px] p-6">
              <div>
                <h3 className="text-xl font-bold text-stone-900">Popup campaign</h3>
                <p className="mt-2 text-sm text-stone-500">
                  Popup tự bật một lần mỗi session khi campaign đang active trên homepage.
                </p>
              </div>

              <CampaignEditor
                campaign={form.homepage.campaignPopup}
                tags={tags}
                vouchers={vouchers}
                onChange={(field, value) => updateCampaignField("campaignPopup", field, value)}
              />
            </section>

            {message ? (
              <p className="rounded-[24px] border border-stone-200 bg-white px-5 py-4 text-sm text-stone-700">
                {message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={saving || uploadingHero}
              className="rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#b38a45] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : "Lưu cấu hình"}
            </button>
          </>
        ) : null}
      </form>
    </AdminShell>
  );
}

function TextField({ label, value, onChange, placeholder = "", type = "text" }) {
  return (
    <label className="space-y-2 text-sm text-stone-600">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
      />
    </label>
  );
}

function TextareaField({ label, value, onChange, placeholder = "", rows = 5 }) {
  return (
    <label className="space-y-2 text-sm text-stone-600">
      <span>{label}</span>
      <textarea
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[24px] border border-stone-200 bg-white px-4 py-3"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="space-y-2 text-sm text-stone-600">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleField({ checked, onChange, label, helper }) {
  return (
    <label className="flex min-h-14 items-center justify-between gap-4 rounded-[24px] border border-stone-200 bg-white px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-stone-900">{label}</p>
        {helper ? <p className="mt-1 text-xs text-stone-500">{helper}</p> : null}
      </div>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function SectionEditor({ section, tags, onChange }) {
  const sourceOptions = sectionTypeOptions;
  const title = {
    newArrivals: "Block Mới về",
    sale: "Block Sale",
    bestSeller: "Block Bán chạy",
  }[section.key];

  return (
    <div className="rounded-[28px] border border-stone-200 bg-white p-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <TextField label="Tiêu đề tiếng Việt" value={section.titleVi} onChange={(value) => onChange("titleVi", value)} />
            <TextField label="Tiêu đề tiếng Hoa" value={section.titleZh} onChange={(value) => onChange("titleZh", value)} />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <TextareaField
              label="Mô tả tiếng Việt"
              value={section.descriptionVi}
              onChange={(value) => onChange("descriptionVi", value)}
              rows={3}
            />
            <TextareaField
              label="Mô tả tiếng Hoa"
              value={section.descriptionZh}
              onChange={(value) => onChange("descriptionZh", value)}
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-4">
          <ToggleField
            checked={section.enabled}
            onChange={(value) => onChange("enabled", value)}
            label={title}
            helper="Tắt nếu chưa muốn hiển thị block này trên homepage."
          />

          <SelectField
            label="Nguồn sản phẩm"
            value={section.source}
            onChange={(value) => onChange("source", value)}
            options={sourceOptions}
          />

          <TextField
            label="Số sản phẩm hiển thị"
            type="number"
            value={String(section.limit)}
            onChange={(value) => onChange("limit", value)}
          />

          <SelectField
            label="Tag dùng khi chọn nguồn theo tag"
            value={section.tagSlug || ""}
            onChange={(value) => onChange("tagSlug", value)}
            options={[
              { value: "", label: "Không chọn" },
              ...tags.map((tag) => ({
                value: tag.slug,
                label: `${tag.name} / ${tag.slug}`,
              })),
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function CampaignEditor({ campaign, tags, vouchers, onChange }) {
  const ctaMode = campaign.ctaUrl ? "url" : campaign.tagSlug ? "tag" : "";

  return (
    <div className="space-y-5 rounded-[28px] border border-stone-200 bg-white p-5">
      <div className="grid gap-5 md:grid-cols-2">
        <ToggleField
          checked={campaign.enabled}
          onChange={(value) => onChange("enabled", value)}
          label="Đang hoạt động"
          helper="Campaign chỉ hiển thị khi đang bật và nằm trong khung thời gian."
        />

        <SelectField
          label="Voucher gắn kèm"
          value={campaign.voucherCode || ""}
          onChange={(value) => onChange("voucherCode", value)}
          options={[
            { value: "", label: "Không gắn voucher" },
            ...vouchers.map((voucher) => ({
              value: voucher.code,
              label: `${voucher.code} - giảm ${voucher.discountPercent}%`,
            })),
          ]}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <TextField
          label="Bắt đầu"
          type="datetime-local"
          value={campaign.startAt || ""}
          onChange={(value) => onChange("startAt", value)}
        />
        <TextField
          label="Kết thúc"
          type="datetime-local"
          value={campaign.endAt || ""}
          onChange={(value) => onChange("endAt", value)}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <TextField label="Tiêu đề tiếng Việt" value={campaign.titleVi} onChange={(value) => onChange("titleVi", value)} />
        <TextField label="Tiêu đề tiếng Hoa" value={campaign.titleZh} onChange={(value) => onChange("titleZh", value)} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <TextareaField
          label="Nội dung tiếng Việt"
          value={campaign.messageVi}
          onChange={(value) => onChange("messageVi", value)}
          rows={4}
        />
        <TextareaField
          label="Nội dung tiếng Hoa"
          value={campaign.messageZh}
          onChange={(value) => onChange("messageZh", value)}
          rows={4}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <TextField label="CTA tiếng Việt" value={campaign.ctaLabelVi} onChange={(value) => onChange("ctaLabelVi", value)} />
        <TextField label="CTA tiếng Hoa" value={campaign.ctaLabelZh} onChange={(value) => onChange("ctaLabelZh", value)} />
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <SelectField
          label="Kiểu CTA"
          value={ctaMode}
          onChange={(value) => {
            if (value === "url") {
              onChange("tagSlug", "");
            }
            if (value === "tag") {
              onChange("ctaUrl", "");
            }
            if (!value) {
              onChange("ctaUrl", "");
              onChange("tagSlug", "");
            }
          }}
          options={campaignTypeOptions}
        />

        <SelectField
          label="Tag điều hướng"
          value={campaign.tagSlug || ""}
          onChange={(value) => onChange("tagSlug", value)}
          options={[
            { value: "", label: "Không chọn" },
            ...tags.map((tag) => ({
              value: tag.slug,
              label: `${tag.name} / ${tag.slug}`,
            })),
          ]}
        />

        <TextField
          label="URL điều hướng"
          value={campaign.ctaUrl || ""}
          onChange={(value) => onChange("ctaUrl", value)}
          placeholder="https://... hoặc /tag/sale"
        />
      </div>
    </div>
  );
}
