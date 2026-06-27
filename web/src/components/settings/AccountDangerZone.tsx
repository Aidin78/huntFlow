"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";
import { deleteAccount } from "@/lib/auth-api";
import { clearAccessToken } from "@/lib/auth-token";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";

type AccountDangerZoneProps = {
  audience: "seeker" | "employer";
};

export function AccountDangerZone({ audience }: AccountDangerZoneProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    if (
      !window.confirm(
        audience === "employer"
          ? "Delete your account? Your company listings will remain on the board without an active employer login."
          : "Delete your account permanently? This cannot be undone.",
      )
    ) {
      return;
    }

    setDeleting(true);
    setError(null);

    const result = await deleteAccount(password);
    setDeleting(false);

    if ("error" in result && result.error) {
      setError(result.error.message ?? "Could not delete account");
      return;
    }

    clearAccessToken();
    router.push("/");
    router.refresh();
  }

  return (
    <DashboardCard title="Danger zone" accent="rose" className="mt-8 max-w-xl">
      <p className="text-sm text-zinc-500">
        Permanently delete your huntFlow account and all associated data. You will need your current password.
      </p>
      <form onSubmit={(e) => void handleDelete(e)} className="mt-4 space-y-3">
        <div>
          <label htmlFor="delete-password" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Current password
          </label>
          <input
            id="delete-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldClass}
          />
        </div>
        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
        <Button type="submit" variant="secondary" size="sm" disabled={deleting} className="border-red-300 text-red-700">
          {deleting ? "Deleting…" : "Delete my account"}
        </Button>
      </form>
    </DashboardCard>
  );
}
