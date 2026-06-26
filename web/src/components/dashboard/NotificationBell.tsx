"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button, joinClasses } from "@/components/ui/button";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/lib/notifications-api";

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
      />
    </svg>
  );
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  try {
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(date);
  } catch {
    return iso;
  }
}

function typeIcon(type: NotificationItem["type"]) {
  switch (type) {
    case "NEW_APPLICATION":
      return "📋";
    case "MESSAGE":
      return "💬";
    case "STATUS_EVENT":
      return "↪";
    case "REMINDER_DUE":
      return "⏱";
    case "INTERVIEW_UPCOMING":
      return "📅";
    default:
      return "🔔";
  }
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const result = await fetchNotifications();
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not load notifications");
      setLoading(false);
      return;
    }
    if ("items" in result) {
      setItems(result.items);
      setUnreadCount(result.unreadCount);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 15000);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!panelRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  async function handleItemClick(item: NotificationItem) {
    if (!item.readAt) {
      await markNotificationRead(item.id);
      setUnreadCount((c) => Math.max(0, c - 1));
      setItems((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, readAt: new Date().toISOString() } : n)),
      );
    }
    setOpen(false);
    if (item.href) {
      router.push(item.href);
    }
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    setUnreadCount(0);
    setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
  }

  const badgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={joinClasses(
          "relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200/80 bg-white text-zinc-600 transition hover:border-emerald-300/50 hover:bg-emerald-50 hover:text-emerald-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-emerald-700/50 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300",
          open && "border-emerald-300/50 bg-emerald-50 text-emerald-800 dark:border-emerald-700/50 dark:bg-emerald-950/40 dark:text-emerald-300",
        )}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
      >
        <BellIcon className="h-4.5 w-4.5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[0.6rem] font-bold text-white">
            {badgeLabel}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-200/80 px-4 py-3 dark:border-zinc-800">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Notifications</p>
            {unreadCount > 0 ? (
              <Button variant="ghost" size="xs" onClick={() => void handleMarkAllRead()}>
                Mark all read
              </Button>
            ) : null}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-zinc-500">Loading…</p>
            ) : error ? (
              <p className="px-4 py-6 text-center text-sm text-red-600 dark:text-red-400">{error}</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-zinc-500">No notifications yet</p>
            ) : (
              <ul>
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => void handleItemClick(item)}
                      className={joinClasses(
                        "flex w-full gap-3 px-4 py-3 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-800/60",
                        !item.readAt && "bg-emerald-50/50 dark:bg-emerald-950/20",
                      )}
                    >
                      <span className="mt-0.5 text-base" aria-hidden>
                        {typeIcon(item.type)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {item.title}
                        </span>
                        {item.body ? (
                          <span className="mt-0.5 block truncate text-xs text-zinc-500">{item.body}</span>
                        ) : null}
                        <span className="mt-1 block text-[0.65rem] text-zinc-400">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </span>
                      {!item.readAt ? (
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
