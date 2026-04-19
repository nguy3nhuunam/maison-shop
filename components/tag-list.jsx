import TagItem from "@/components/tag-item";

export default function TagList({ tags = [], activeSlug = "all", allLabel = "Tất cả" }) {
  const visibleTags = Array.isArray(tags) ? tags.filter((tag) => tag?.isActive !== false) : [];

  return (
    <div className="mt-2.5 flex flex-wrap gap-2">
      <TagItem href="/" label={allLabel} active={activeSlug === "all"} />
      {visibleTags.map((tag) => (
        <TagItem
          key={tag.slug}
          href={`/tag/${tag.slug}`}
          label={tag.name}
          active={activeSlug === tag.slug}
        />
      ))}
    </div>
  );
}
