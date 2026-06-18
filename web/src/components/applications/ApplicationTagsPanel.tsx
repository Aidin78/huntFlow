"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { TagChip } from "@/components/ui/TagChip";
import { Button } from "@/components/ui/button";
import {
  TAG_COLOR_PRESETS,
  attachApplicationTag,
  attachApplicationTagByName,
  detachApplicationTag,
  fetchApplicationTags,
  fetchSeekerTags,
  type SeekerTag,
  type SeekerTagSummary,
  type TagColorPreset,
} from "@/lib/seeker-tags-api";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";

type ApplicationTagsPanelProps = {
  applicationId: string;
  initialTags?: SeekerTagSummary[];
};

export function ApplicationTagsPanel({ applicationId, initialTags }: ApplicationTagsPanelProps) {
  const [items, setItems] = useState<SeekerTagSummary[]>(initialTags ?? []);
  const [catalog, setCatalog] = useState<SeekerTag[]>([]);
  const [loading, setLoading] = useState(!initialTags);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [selectedColor, setSelectedColor] = useState<TagColorPreset>(TAG_COLOR_PRESETS[0]);
  const [saving, setSaving] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setError(null);
    const [tagsResult, catalogResult] = await Promise.all([
      fetchApplicationTags(applicationId),
      fetchSeekerTags(),
    ]);

    if ("error" in tagsResult && tagsResult.error) {
      setError(tagsResult.error.message ?? "Could not load tags");
      setLoading(false);
      return;
    }
    if ("items" in tagsResult) {
      setItems(tagsResult.items);
    }
    if ("items" in catalogResult) {
      setCatalog(catalogResult.items);
    }
    setLoading(false);
  }, [applicationId]);

  useEffect(() => {
    if (initialTags) {
      void fetchSeekerTags().then((result) => {
        if ("items" in result) setCatalog(result.items);
      });
      return;
    }
    void load();
  }, [initialTags, load]);

  const attachedIds = useMemo(() => new Set(items.map((tag) => tag.id)), [items]);

  const suggestions = useMemo(() => {
    const query = input.trim().toLowerCase();
    if (!query) {
      return catalog.filter((tag) => !attachedIds.has(tag.id)).slice(0, 8);
    }
    return catalog
      .filter((tag) => !attachedIds.has(tag.id) && tag.name.toLowerCase().includes(query))
      .slice(0, 8);
  }, [attachedIds, catalog, input]);

  async function handleAttachExisting(tag: SeekerTagSummary) {
    setSaving(true);
    setError(null);
    const result = await attachApplicationTag(applicationId, tag.id);
    setSaving(false);
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not add tag");
      return;
    }
    if ("tag" in result) {
      setItems((prev) => [...prev, result.tag].sort((a, b) => a.name.localeCompare(b.name)));
      setInput("");
      setShowSuggestions(false);
    }
  }

  async function handleAttachByName(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;

    const existing = catalog.find((tag) => tag.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      await handleAttachExisting(existing);
      return;
    }

    setSaving(true);
    setError(null);
    const result = await attachApplicationTagByName(applicationId, {
      name: trimmed,
      color: selectedColor,
    });
    setSaving(false);
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not add tag");
      return;
    }
    if ("tag" in result) {
      setItems((prev) => [...prev, result.tag].sort((a, b) => a.name.localeCompare(b.name)));
      setCatalog((prev) => {
        if (prev.some((tag) => tag.id === result.tag.id)) return prev;
        return [
          ...prev,
          {
            ...result.tag,
            usageCount: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ].sort((a, b) => a.name.localeCompare(b.name));
      });
      setInput("");
      setShowSuggestions(false);
    }
  }

  async function handleRemove(tagId: string) {
    setSaving(true);
    setError(null);
    const result = await detachApplicationTag(applicationId, tagId);
    setSaving(false);
    if (result && "error" in result && result.error) {
      setError(result.error.message ?? "Could not remove tag");
      return;
    }
    setItems((prev) => prev.filter((tag) => tag.id !== tagId));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void handleAttachByName(input);
  }

  return (
    <section className="rounded-3xl border border-zinc-200/80 bg-white/80 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Tags</h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Label this application — remote, referral, priority, and more.
          </p>
        </div>
      </div>

      {error ? (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-4 text-sm text-zinc-500">Loading tags…</p>
      ) : (
        <>
          {items.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {items.map((tag) => (
                <TagChip key={tag.id} tag={tag} onRemove={() => void handleRemove(tag.id)} size="md" />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">No tags yet.</p>
          )}

          <form onSubmit={handleSubmit} className="relative mt-4">
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400" htmlFor="tag-input">
              Add tag
            </label>
            <input
              ref={inputRef}
              id="tag-input"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                window.setTimeout(() => setShowSuggestions(false), 150);
              }}
              placeholder="Type a tag name…"
              className={fieldClass}
              disabled={saving}
              autoComplete="off"
            />

            {showSuggestions && suggestions.length > 0 ? (
              <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                {suggestions.map((tag) => (
                  <li key={tag.id}>
                    <button
                      type="button"
                      className="flex w-full items-center px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => void handleAttachExisting(tag)}
                    >
                      {tag.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">New tag color</span>
              {TAG_COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`h-5 w-5 rounded-full border-2 transition ${
                    selectedColor === color ? "border-zinc-900 dark:border-white" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Color ${color}`}
                />
              ))}
            </div>

            <div className="mt-3">
              <Button type="submit" variant="emerald" size="sm" disabled={saving || !input.trim()}>
                {saving ? "Adding…" : "Add tag"}
              </Button>
            </div>
          </form>
        </>
      )}
    </section>
  );
}
