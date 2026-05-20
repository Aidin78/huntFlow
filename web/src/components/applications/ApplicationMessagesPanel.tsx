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
    <div className="flex flex-col rounded-3xl border border-zinc-200/80 bg-white/90 dark:border-zinc-800/80 dark:bg-zinc-900/60">
      <div className="border-b border-zinc-200/80 px-5 py-4 dark:border-zinc-800/80">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Messages</h3>
        <p className="mt-0.5 text-xs text-zinc-500">Conversation about this application. Updates every 5 seconds.</p>
      </div>

      <div className="flex max-h-[420px] min-h-[240px] flex-1 flex-col overflow-y-auto px-4 py-4">
        {loading ? (
          <p className="text-sm text-zinc-500">Loading messages…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-zinc-500">No messages yet. Start the conversation below.</p>
        ) : (
          <ul className="space-y-3">
            {messages.map((msg) => {
              const isSelf =
                audience === "employer" ? msg.sender.role === "EMPLOYER" : msg.sender.role === "JOB_SEEKER";
              return (
                <li
                  key={msg.id}
                  className={`flex ${isSelf ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                      isSelf
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                    }`}
                  >
                    <p className="text-[0.65rem] font-semibold opacity-80">{senderLabel(msg)}</p>
                    <p className="mt-1 whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                    <p className="mt-1.5 text-[0.65rem] opacity-60">
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

      <form onSubmit={(e) => void handleSend(e)} className="border-t border-zinc-200/80 p-4 dark:border-zinc-800/80">
        <label htmlFor="message-body" className="sr-only">
          Message
        </label>
        <textarea
          id="message-body"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="Write a message…"
          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <div className="mt-3 flex justify-end">
          <Button type="submit" size="sm" disabled={sending || !draft.trim()}>
            {sending ? "Sending…" : "Send"}
          </Button>
        </div>
      </form>
    </div>
  );
}
