"use client";

import { useCallback, useEffect, useState } from "react";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import {
  fetchSeekerNotificationPreferences,
  updateSeekerNotificationPreferences,
  type SeekerNotificationPreferences,
} from "@/lib/seeker-settings-api";

type PrefKey = keyof Pick<
  SeekerNotificationPreferences,
  "notifyNewMessage" | "notifyInterviewReminder" | "notifyStatusEvent"
>;

const PREF_ITEMS: Array<{
  key: PrefKey;
  label: string;
  description: string;
}> = [
  {
    key: "notifyNewMessage",
    label: "New messages",
    description: "When an employer replies in an application thread.",
  },
  {
    key: "notifyStatusEvent",
    label: "Application status updates",
    description: "When an employer moves your application to a new stage.",
  },
  {
    key: "notifyInterviewReminder",
    label: "Due reminders & interviews",
    description: "When a follow-up reminder is due or an interview start time arrives.",
  },
];

function BellIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
      />
    </svg>
  );
}

export function SeekerNotificationSettings() {
  const [prefs, setPrefs] = useState<SeekerNotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<PrefKey | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const result = await fetchSeekerNotificationPreferences();
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not load preferences");
      setLoading(false);
      return;
    }
    if ("notifyNewMessage" in result) {
      setPrefs(result);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggle(key: PrefKey) {
    if (!prefs) return;

    const next = !prefs[key];
    setPrefs({ ...prefs, [key]: next });
    setSavingKey(key);

    const result = await updateSeekerNotificationPreferences({ [key]: next });
    if ("error" in result && result.error) {
      setPrefs(prefs);
      setError(result.error.message ?? "Could not save preference");
    } else if ("notifyNewMessage" in result) {
      setPrefs(result);
      setError(null);
    }
    setSavingKey(null);
  }

  return (
    <DashboardCard
      title="Notifications"
      description="Choose what appears in your in-app notification bell."
      icon={<BellIcon />}
      accent="violet"
      className="mb-8 max-w-xl"
    >
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-14 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800/50" />
          ))}
        </div>
      ) : error && !prefs ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : prefs ? (
        <>
          {error ? (
            <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </p>
          ) : null}
          <ul className="space-y-3">
            {PREF_ITEMS.map((item) => {
              const enabled = prefs[item.key];
              const disabled = savingKey === item.key;
              return (
                <li
                  key={item.key}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 px-4 py-3.5 dark:border-zinc-700/80 dark:bg-zinc-950/30"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.label}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">{item.description}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    disabled={disabled}
                    onClick={() => void toggle(item.key)}
                    className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                      enabled ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"
                    } ${disabled ? "opacity-50" : ""}`}
                  >
                    <span
                      className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                        enabled ? "left-5" : "left-0.5"
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </DashboardCard>
  );
}
