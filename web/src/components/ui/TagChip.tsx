import type { SeekerTagSummary } from "@/lib/seeker-tags-api";
import { tagChipStyle } from "@/lib/seeker-tags-api";

type TagChipProps = {
  tag: SeekerTagSummary;
  onRemove?: () => void;
  size?: "sm" | "md";
};

export function TagChip({ tag, onRemove, size = "sm" }: TagChipProps) {
  const style = tagChipStyle(tag.color);
  const sizeClass =
    size === "md"
      ? "px-3 py-1 text-xs"
      : "px-2 py-0.5 text-[11px]";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${sizeClass}`}
      style={style}
    >
      {tag.name}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full p-0.5 opacity-70 transition hover:opacity-100"
          aria-label={`Remove ${tag.name}`}
        >
          <span aria-hidden>×</span>
        </button>
      ) : null}
    </span>
  );
}

type TagChipListProps = {
  tags: SeekerTagSummary[];
  maxVisible?: number;
  onRemove?: (tagId: string) => void;
};

export function TagChipList({ tags, maxVisible = 3, onRemove }: TagChipListProps) {
  if (tags.length === 0) return null;

  const visible = tags.slice(0, maxVisible);
  const overflow = tags.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((tag) => (
        <TagChip
          key={tag.id}
          tag={tag}
          onRemove={onRemove ? () => onRemove(tag.id) : undefined}
        />
      ))}
      {overflow > 0 ? (
        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">+{overflow}</span>
      ) : null}
    </div>
  );
}
