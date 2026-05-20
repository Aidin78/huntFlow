"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  fetchApplicationMessages,
  sendApplicationMessage,
  type ApplicationMessage,
} from "@/lib/application-messages-api";

type ApplicationMessagesPanelProps = {
  applicationId: string;
  audience: "employer" | "seeker";
  active: boolean;
};

function senderLabel(msg: ApplicationMessage): string {
  return msg.sender.name?.trim() || msg.sender.email;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  return (parts[0]?.slice(0, 2) ?? "?").toUpperCase();
}

export function ApplicationMessagesPanel({
  applicationId,
  audience,
  active,
}: ApplicationMessagesPanelProps) {
  const [messages, setMessages] = useState<ApplicationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const result = await fetchApplicationMessages(audience, applicationId, { limit: 100 });
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not load messages");
      setLoading(false);
      return;
    }
    if ("items" in result) {
      setMessages(result.items);
      setError(null);
    }
    setLoading(false);
  }, [applicationId, audience]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      void load();
    }, 5000);
    return () => window.clearInterval(id);
  }, [active, load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setSending(true);
    setError(null);
    const result = await sendApplicationMessage(audience, applicationId, text);
    setSending(false);
    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not send message");
      return;
    }
    if ("item" in result) {
      setMessages((prev) => [...prev, result.item]);
      setDraft("");
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/70">
      <div className="flex items-center justify-between border-b border-zinc-200/80 bg-gradient-to-r from-emerald-50/80 to-sky-50/50 px-5 py-4 dark:border-zinc-800/80 dark:from-emerald-950/20 dark:to-sky-950/10">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Messages</h3>
          <p className="mt-0.5 text-xs text-zinc-500">Conversation about this application</p>
        </div>
        {active ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[0.65rem] font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Live · 5s refresh
          </span>
        ) : null}
      </div>

      <div className="flex max-h-[420px] min-h-[260px] flex-1 flex-col overflow-y-auto bg-zinc-50/50 px-4 py-4 dark:bg-zinc-950/30">
        {loading ? (
          <p className="text-sm text-zinc-500">Loading messages…</p>
        ) : messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">No messages yet</p>
            <p className="mt-1 max-w-xs text-xs text-zinc-500">Start the conversation below — the other party will see it here.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {messages.map((msg) => {
              const isSelf =
                audience === "employer" ? msg.sender.role === "EMPLOYER" : msg.sender.role === "JOB_SEEKER";
              const label = senderLabel(msg);
              return (
                <li key={msg.id} className={`flex gap-2 ${isSelf ? "flex-row-reverse" : "flex-row"}`}>
                  <span
                    className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[0.65rem] font-bold ${
                      isSelf
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"
                    }`}
                    aria-hidden
                  >
                    {initials(label)}
                  </span>
                  <div className={`max-w-[78%] ${isSelf ? "items-end" : "items-start"}`}>
                    <p className={`mb-1 text-[0.65rem] font-semibold text-zinc-500 ${isSelf ? "text-right" : ""}`}>
                      {label}
                    </p>
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                        isSelf
                          ? "rounded-tr-md bg-emerald-600 text-white"
                          : "rounded-tl-md border border-zinc-200/80 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                    </div>
                    <p className={`mt-1 text-[0.65rem] text-zinc-400 ${isSelf ? "text-right" : ""}`}>
                      {new Intl.DateTimeFormat("en-GB", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(msg.createdAt))}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div ref={bottomRef} />
      </div>

      {error ? (
        <p className="px-4 pb-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      <form
        onSubmit={(e) => void handleSend(e)}
        className="border-t border-zinc-200/80 bg-white p-4 dark:border-zinc-800/80 dark:bg-zinc-900/80"
      >
        <label htmlFor="message-body" className="sr-only">
          Message
        </label>
        <textarea
          id="message-body"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="Write a message…"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950"
        />
        <div className="mt-3 flex justify-end">
          <Button type="submit" variant="success" size="sm" disabled={sending || !draft.trim()}>
            {sending ? "Sending…" : "Send message"}
          </Button>
        </div>
      </form>
    </div>
  );
}
