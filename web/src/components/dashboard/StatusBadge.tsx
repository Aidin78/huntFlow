import {
  applicationStatusClass,
  applicationStatusLabel,
  type JobApplicationStatus,
} from "@/lib/seeker-applications-api";

type StatusBadgeProps = {
  status: JobApplicationStatus;
  size?: "sm" | "md";
};

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const sizeClass = size === "md" ? "px-3 py-1 text-xs" : "px-2.5 py-0.5 text-[0.7rem]";
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ring-1 ring-inset ${sizeClass} ${applicationStatusClass(status)}`}
    >
      {applicationStatusLabel(status)}
    </span>
  );
}
