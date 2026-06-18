import { legalCounselNote, type LegalSection } from "@/content/support-content";

type LegalProseProps = {
  sections: LegalSection[];
  lastUpdated: string;
};

export function LegalProse({ sections, lastUpdated }: LegalProseProps) {
  return (
    <article className="mx-auto max-w-3xl">
      <p className="mb-8 text-center text-xs text-zinc-500">Last updated: {lastUpdated}</p>
      <div className="space-y-8">
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="rounded-3xl border border-zinc-200/80 bg-white/95 p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/70 sm:p-8"
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{section.title}</h2>
            <div className="mt-4 space-y-3">
              {section.paragraphs.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
      <p className="mt-10 text-center text-xs text-zinc-500">{legalCounselNote}</p>
    </article>
  );
}
