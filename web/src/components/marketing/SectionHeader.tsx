type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
};

export function SectionHeader({ eyebrow, title, subtitle, align = "center" }: SectionHeaderProps) {
  const alignClass = align === "center" ? "text-center" : "text-left";
  const subAlign = align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl";

  return (
    <div className={alignClass}>
      {eyebrow ? (
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-emerald-700/90 dark:text-emerald-400/90">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance text-zinc-900 sm:text-4xl dark:text-zinc-50">
        {title}
      </h2>
      {subtitle ? (
        <p
          className={`mt-3 text-base leading-relaxed text-pretty text-zinc-600 dark:text-zinc-400 ${subAlign}`}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
