"use client";

import { useCallback, useEffect, useState } from "react";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";
import {
  getPushSubscriptionState,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push-notifications";

export function PushNotificationSettings() {
  const [state, setState] = useState<"loading" | "unsupported" | "denied" | "subscribed" | "unsubscribed">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const next = await getPushSubscriptionState();
    setState(next);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleEnable() {
    setBusy(true);
    setError(null);
    const result = await subscribeToPush();
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      await load();
      return;
    }
    setState("subscribed");
  }

  async function handleDisable() {
    setBusy(true);
    setError(null);
    await unsubscribeFromPush();
    setBusy(false);
    setState("unsubscribed");
  }

  return (
    <DashboardCard title="Browser notifications" accent="violet" className="mb-8 max-w-xl">
      <p className="text-sm text-zinc-500">
        Get alerts in your browser when huntFlow sends you email notifications. Uses the same preferences as
        your in-app bell.
      </p>

      {state === "loading" ? <p className="mt-3 text-sm text-zinc-500">Loading…</p> : null}
      {state === "unsupported" ? (
        <p className="mt-3 text-sm text-zinc-500">Push is not supported in this browser.</p>
      ) : null}
      {state === "denied" ? (
        <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">
          Notifications are blocked. Enable them in your browser site settings to use push.
        </p>
      ) : null}

      {state === "subscribed" || state === "unsubscribed" ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {state === "subscribed" ? (
            <Button type="button" variant="secondary" size="sm" disabled={busy} onClick={() => void handleDisable()}>
              {busy ? "Updating…" : "Disable browser notifications"}
            </Button>
          ) : (
            <Button type="button" variant="success" size="sm" disabled={busy} onClick={() => void handleEnable()}>
              {busy ? "Enabling…" : "Enable browser notifications"}
            </Button>
          )}
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p> : null}
    </DashboardCard>
  );
}
