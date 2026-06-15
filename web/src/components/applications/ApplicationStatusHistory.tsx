import { applicationStatusLabel } from "@/lib/seeker-applications-api";
import type { StatusHistoryEvent } from "@/lib/employer-applications-api";

type ApplicationStatusHistoryProps = {
  events: StatusHistoryEvent[];
  className?: string;
};

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

export function ApplicationStatusHistory({ events, className }: ApplicationStatusHistoryProps) {
  if (events.length === 0) {
    return <p className="text-sm text-zinc-500">No status changes recorded yet.</p>;
  }

  return (
    <ol className={className ?? "space-y-3"}>
      {events.map((event, index) => {
        const fromLabel = event.from ? applicationStatusLabel(event.from as never) : "New";
        const toLabel = applicationStatusLabel(event.to as never);
        return (
          <li
            key={`${event.at}-${index}`}
            className="rounded-2xl border border-zinc-200/80 bg-zinc-50/50 px-4 py-3 dark:border-zinc-700/80 dark:bg-zinc-950/30"
          >
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {fromLabel} → {toLabel}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">{formatWhen(event.at)}</p>
            {event.note ? (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{event.note}</p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
