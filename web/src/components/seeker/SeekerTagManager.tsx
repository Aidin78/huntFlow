"use client";

import { useCallback, useEffect, useState } from "react";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { TagChip } from "@/components/ui/TagChip";
import { Button } from "@/components/ui/button";
import {
  TAG_COLOR_PRESETS,
  deleteSeekerTag,
  fetchSeekerTags,
  updateSeekerTag,
  type SeekerTag,
  type TagColorPreset,
} from "@/lib/seeker-tags-api";

const fieldClass =
  "mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";

export function SeekerTagManager() {
  const [items, setItems] = useState<SeekerTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState<TagColorPreset>(TAG_COLOR_PRESETS[0]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const result = await fetchSeekerTags();
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not load tags");
      setLoading(false);
      return;
    }
    if ("items" in result) {
      setItems(result.items);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function startEdit(tag: SeekerTag) {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor((tag.color as TagColorPreset) ?? TAG_COLOR_PRESETS[0]);
  }

  async function handleSave(tagId: string) {
    setSaving(true);
    setError(null);
    const result = await updateSeekerTag(tagId, {
      name: editName.trim(),
      color: editColor,
    });
    setSaving(false);
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not update tag");
      return;
    }
    if ("tag" in result) {
      setItems((prev) =>
        prev.map((tag) => (tag.id === tagId ? result.tag : tag)).sort((a, b) => a.name.localeCompare(b.name)),
      );
      setEditingId(null);
    }
  }

  async function handleDelete(tag: SeekerTag) {
    if (!window.confirm(`Delete tag "${tag.name}"? It will be removed from all applications.`)) return;
    setSaving(true);
    setError(null);
    const result = await deleteSeekerTag(tag.id);
    setSaving(false);
    if (result && "error" in result && result.error) {
      setError(result.error.message ?? "Could not delete tag");
      return;
    }
    setItems((prev) => prev.filter((row) => row.id !== tag.id));
  }

  return (
    <DashboardCard title="Tags" accent="violet" className="mt-8 max-w-3xl">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Rename or remove labels used across your applications. Create new tags from any application detail page.
      </p>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-4 text-sm text-zinc-500">Loading tags…</p>
      ) : items.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">No tags yet. Add tags from an application page.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((tag) => (
            <li
              key={tag.id}
              className="rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-950/40"
            >
              {editingId === tag.id ? (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Name
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={fieldClass}
                    />
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-zinc-500">Color</span>
                    {TAG_COLOR_PRESETS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setEditColor(color)}
                        className={`h-5 w-5 rounded-full border-2 ${
                          editColor === color ? "border-zinc-900 dark:border-white" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Color ${color}`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="emerald"
                      size="sm"
                      disabled={saving || !editName.trim()}
                      onClick={() => void handleSave(tag.id)}
                    >
                      Save
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <TagChip tag={tag} size="md" />
                    <span className="text-xs text-zinc-500">
                      Used on {tag.usageCount} application{tag.usageCount === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="secondary" size="sm" onClick={() => startEdit(tag)}>
                      Rename
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={saving}
                      onClick={() => void handleDelete(tag)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
