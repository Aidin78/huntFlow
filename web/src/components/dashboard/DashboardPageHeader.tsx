type DashboardPageHeaderProps = {
  title: string;
  subtitle?: string;
  badge?: string;
};

export function DashboardPageHeader({ title, subtitle, badge }: DashboardPageHeaderProps) {
  return (
    <header className="mb-8">
      {badge ? (
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-sky-700 dark:text-sky-400">
          {badge}
        </p>
      ) : null}
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{subtitle}</p>
      ) : null}
    </header>
  );
}
