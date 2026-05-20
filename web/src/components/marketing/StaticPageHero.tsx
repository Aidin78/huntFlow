type StaticPageHeroProps = {
  badge: string;
  title: string;
  subtitle: string;
};

export function StaticPageHero({ badge, title, subtitle }: StaticPageHeroProps) {
  return (
    <header className="mx-auto max-w-3xl text-center">
      <p className="inline-flex rounded-full bg-gradient-to-r from-emerald-500/10 to-sky-500/10 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-800 ring-1 ring-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/25">
        {badge}
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
        {title}
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
        {subtitle}
      </p>
    </header>
  );
}
