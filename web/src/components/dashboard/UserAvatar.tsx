const GRADIENTS = [
  "from-sky-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-sky-600",
] as const;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return (parts[0]?.slice(0, 2) ?? "?").toUpperCase();
}

type UserAvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeClass: Record<NonNullable<UserAvatarProps["size"]>, string> = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

export function UserAvatar({ name, size = "md", className = "" }: UserAvatarProps) {
  const gradient = GRADIENTS[hashString(name) % GRADIENTS.length];
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br font-bold text-white shadow-md shadow-black/10 ring-2 ring-white/20 ${gradient} ${sizeClass[size]} ${className}`}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
