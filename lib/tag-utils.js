export function slugifyTagName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeTagSlug(value) {
  return slugifyTagName(value);
}

export function normalizeTagSlugs(values) {
  const source = Array.isArray(values) ? values : [values];
  return [...new Set(source.map(normalizeTagSlug).filter(Boolean))];
}
