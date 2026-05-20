import type { ReactNode } from "react";

type IconProps = { className?: string };

export function LinkedInIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 114.126 0 2.063 2.063 0 01-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function GitHubIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export function PortfolioIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
      />
    </svg>
  );
}

export function LocationIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

export function PhoneIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.927 1.23a11.042 11.042 0 01-5.516-5.516l1.23-.927a.75.75 0 01.417-1.173l-1.106-4.423A.75.75 0 006.102 3.75H4.5A2.25 2.25 0 002.25 6v.75z"
      />
    </svg>
  );
}

export type SocialLinkKind = "linkedin" | "github" | "portfolio";

const socialStyles: Record<SocialLinkKind, string> = {
  linkedin:
    "border-sky-200/80 bg-sky-50 text-sky-800 hover:border-sky-300 hover:bg-sky-100 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-950/60",
  portfolio:
    "border-violet-200/80 bg-violet-50 text-violet-800 hover:border-violet-300 hover:bg-violet-100 dark:border-violet-900/50 dark:bg-violet-950/40 dark:text-violet-300 dark:hover:bg-violet-950/60",
  github:
    "border-zinc-300/80 bg-zinc-100 text-zinc-800 hover:border-zinc-400 hover:bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700",
};

const socialLabels: Record<SocialLinkKind, string> = {
  linkedin: "LinkedIn",
  github: "GitHub",
  portfolio: "Portfolio",
};

function SocialIcon({ kind, className }: { kind: SocialLinkKind; className?: string }) {
  switch (kind) {
    case "linkedin":
      return <LinkedInIcon className={className} />;
    case "github":
      return <GitHubIcon className={className} />;
    case "portfolio":
      return <PortfolioIcon className={className} />;
  }
}

export function ExternalLinkIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

type ExternalLinkButtonProps = {
  href: string;
  label: string;
};

export function ExternalLinkButton({ href, label }: ExternalLinkButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-xl border border-zinc-300/80 bg-zinc-100 px-3.5 py-2 text-xs font-semibold text-zinc-800 transition-all hover:-translate-y-px hover:border-zinc-400 hover:bg-zinc-200 hover:shadow-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
    >
      <ExternalLinkIcon className="h-4 w-4 shrink-0" />
      {label}
    </a>
  );
}

type SocialLinkButtonProps = {
  kind: SocialLinkKind;
  href: string;
  label?: string;
};

export function SocialLinkButton({ kind, href, label }: SocialLinkButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all hover:-translate-y-px hover:shadow-sm ${socialStyles[kind]}`}
    >
      <SocialIcon kind={kind} className="h-4 w-4 shrink-0" />
      {label ?? socialLabels[kind]}
    </a>
  );
}

type SocialLinksProps = {
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  className?: string;
};

export function SocialLinks({ linkedinUrl, githubUrl, portfolioUrl, className = "" }: SocialLinksProps) {
  const links = [
    linkedinUrl ? { kind: "linkedin" as const, href: linkedinUrl } : null,
    portfolioUrl ? { kind: "portfolio" as const, href: portfolioUrl } : null,
    githubUrl ? { kind: "github" as const, href: githubUrl } : null,
  ].filter(Boolean);

  if (links.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {links.map((link) => (
        <SocialLinkButton key={link!.kind} kind={link!.kind} href={link!.href} />
      ))}
    </div>
  );
}

type SocialInputProps = {
  id: string;
  kind: SocialLinkKind;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SocialInput({ id, kind, value, onChange, placeholder }: SocialInputProps) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        <SocialIcon kind={kind} className="h-3.5 w-3.5 opacity-70" />
        {socialLabels[kind]}
      </label>
      <div className="relative mt-1.5">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
          <SocialIcon kind={kind} className="h-4 w-4 opacity-60" />
        </span>
        <input
          id={id}
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? `https://${kind === "linkedin" ? "linkedin.com/in/…" : kind === "github" ? "github.com/…" : "yoursite.com"}`}
          className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-10 pr-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </div>
    </div>
  );
}

type DashboardStatCardProps = {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "emerald" | "violet" | "sky" | "amber";
  icon?: ReactNode;
};

const toneStyles: Record<NonNullable<DashboardStatCardProps["tone"]>, string> = {
  default: "border-zinc-200/80 bg-white/90 dark:border-zinc-800/80 dark:bg-zinc-900/70",
  emerald:
    "border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-white dark:border-emerald-900/40 dark:from-emerald-950/30 dark:to-zinc-900/70",
  violet:
    "border-violet-200/60 bg-gradient-to-br from-violet-50 to-white dark:border-violet-900/40 dark:from-violet-950/30 dark:to-zinc-900/70",
  sky: "border-sky-200/60 bg-gradient-to-br from-sky-50 to-white dark:border-sky-900/40 dark:from-sky-950/30 dark:to-zinc-900/70",
  amber:
    "border-amber-200/60 bg-gradient-to-br from-amber-50 to-white dark:border-amber-900/40 dark:from-amber-950/30 dark:to-zinc-900/70",
};

const toneLabel: Record<NonNullable<DashboardStatCardProps["tone"]>, string> = {
  default: "text-zinc-500",
  emerald: "text-emerald-700 dark:text-emerald-400",
  violet: "text-violet-700 dark:text-violet-400",
  sky: "text-sky-700 dark:text-sky-400",
  amber: "text-amber-700 dark:text-amber-400",
};

const toneValue: Record<NonNullable<DashboardStatCardProps["tone"]>, string> = {
  default: "text-zinc-900 dark:text-zinc-50",
  emerald: "text-emerald-900 dark:text-emerald-100",
  violet: "text-violet-900 dark:text-violet-100",
  sky: "text-sky-900 dark:text-sky-100",
  amber: "text-amber-900 dark:text-amber-100",
};

export function DashboardStatCard({
  label,
  value,
  hint,
  tone = "default",
  icon,
}: DashboardStatCardProps) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${toneStyles[tone]}`}>
      <div className="flex items-start justify-between gap-2">
        <p className={`text-xs font-semibold uppercase tracking-wide ${toneLabel[tone]}`}>{label}</p>
        {icon ? (
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone === "default" ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800" : ""} ${tone !== "default" ? toneLabel[tone] : ""}`}>
            {icon}
          </span>
        ) : null}
      </div>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${toneValue[tone]}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}
