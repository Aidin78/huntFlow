/**
 * Marketing copy for the public homepage and shared layout chrome.
 * Dynamic figures (open roles, featured jobs) come from GET /api/public/home.
 */

export type RoleTabId = "job_seeker" | "employer";

export type RolePathStep = { title: string; body: string };

export type FeatureItem = {
  title: string;
  description: string;
  icon: string;
};

export type WhyItem = { title: string; body: string };

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
};

export const marketingSections = {
  path: {
    title: "How huntFlow works",
    subtitle:
      "One platform for tracking your search and, when you hire, for running a clear pipeline on the same job board.",
    tablistAria: "Audience type",
  },
  features: {
    title: "Built for real job searches",
    subtitle:
      "Everything on this list ships today — from board applications to off-platform roles you add yourself.",
  },
  why: {
    title: "Why huntFlow?",
  },
  jobs: {
    title: "Open roles on the board",
    subtitle:
      "Live listings from companies on huntFlow. Apply in one click and the role lands in your pipeline automatically.",
  },
  testimonials: {
    title: "What job seekers say",
    subtitle: "People use huntFlow to stay organised when several applications are in flight at once.",
  },
};

/** Hero copy switches with Job seeker / Employer tabs (see `MarketingHero`). */
export const marketingHeroByAudience: Record<
  RoleTabId,
  { eyebrow: string; title: string; subtitle: string }
> = {
  job_seeker: {
    eyebrow: "For people actively interviewing",
    title: "Every application, every stage — one calm pipeline.",
    subtitle:
      "Apply on the huntFlow job board or log roles from LinkedIn and company sites. Track status, interviews, reminders, and employer messages without losing context.",
  },
  employer: {
    eyebrow: "For teams hiring on huntFlow",
    title: "Publish roles, review applicants, and move candidates forward.",
    subtitle:
      "Post openings to the public board, see who applied with cover letters and resumes, message candidates, and set pipeline status from Applied to Offer.",
  },
};

export const marketingRolePaths: Record<
  RoleTabId,
  { label: string; headline: string; steps: RolePathStep[] }
> = {
  job_seeker: {
    label: "Job seeker",
    headline: "Your path on huntFlow",
    steps: [
      {
        title: "Create your profile and resume",
        body: "Add a headline, links, and an optional PDF resume — employers see this when you apply on the board.",
      },
      {
        title: "Apply on the board or add roles manually",
        body: "Board applications sync automatically. For off-platform roles, add company, title, and notes in seconds.",
      },
      {
        title: "Run the pipeline with interviews and reminders",
        body: "Move stages yourself for manual entries, message employers on board apps, and schedule interviews plus follow-up reminders.",
      },
    ],
  },
  employer: {
    label: "Employer",
    headline: "Your hiring path on huntFlow",
    steps: [
      {
        title: "Set up your company profile",
        body: "Add tagline, locations, and about text so candidates know who you are before they apply.",
      },
      {
        title: "Publish active job listings",
        body: "Roles appear on the public job board. Seekers apply with cover letters and the resume on their profile.",
      },
      {
        title: "Review, message, and update status",
        body: "Open each application for full detail, chat with the candidate, and move them to Interview, Offer, or Rejected.",
      },
    ],
  },
};

export const marketingFeatures: FeatureItem[] = [
  {
    icon: "◎",
    title: "Application pipeline",
    description:
      "Applied, interview, offer, rejected, or archived — every role has a clear stage, with a full status history.",
  },
  {
    icon: "✎",
    title: "Manual + board tracking",
    description:
      "Roles from the huntFlow board and jobs you applied to elsewhere live in the same list, with notes and source links.",
  },
  {
    icon: "⏱",
    title: "Interviews & reminders",
    description:
      "Schedule interview rounds and follow-up reminders per application. Your dashboard shows what is coming up next.",
  },
  {
    icon: "💬",
    title: "Messages & notifications",
    description:
      "Message employers on board applications and get in-app alerts when status changes or new replies arrive.",
  },
  {
    icon: "🏷",
    title: "Tags & filters",
    description:
      "Label applications (remote, referral, priority) and slice your pipeline by tag, status, or source in one view.",
  },
];

export const marketingWhy: WhyItem[] = [
  {
    title: "Job seeker first",
    body: "The product is designed for people juggling multiple searches — fast logging, obvious status, and less tab fatigue.",
  },
  {
    title: "One source of truth",
    body: "Stop reconciling spreadsheets, email threads, and memory. Company, role, stage, and notes stay together.",
  },
  {
    title: "Board and employer tools connected",
    body: "Seekers apply on the same listings employers publish, so applications, messages, and pipeline updates stay in sync.",
  },
];

export const marketingTestimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "I apply on the board and track everything else manually in the same place. Interviews and reminders on the dashboard actually keep me on top of follow-ups.",
    name: "Alex M.",
    role: "Backend engineer",
  },
  {
    id: "t2",
    quote:
      "Status history and messages per application beat digging through email. I always know whether I'm waiting on them or they are waiting on me.",
    name: "Samira P.",
    role: "Product designer",
  },
];

export const marketingFinalCta = {
  title: "Start with the account that fits you.",
  subtitle:
    "Job seekers get a pipeline for every role. Employers get listings, applicants, and messaging on one platform.",
  jobSeekerButton: "Create job seeker account",
  employerButton: "Create employer account",
  signInLine: "Already registered?",
  signInLink: "Sign in with the same audience you chose at signup.",
};

export const marketingFooter = {
  tagline: "huntFlow — track applications, run interviews, and hire from one job board.",
  columns: [
    {
      title: "Product",
      links: [
        { label: "How it works", href: "/#path" },
        { label: "Features", href: "/#features" },
        { label: "Why huntFlow?", href: "/#why" },
        { label: "Job board", href: "/jobs" },
        { label: "Open roles", href: "/#jobs" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Contact", href: "/contact" },
        { label: "FAQ", href: "/faq" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
      ],
    },
  ],
  social: [
    { label: "LinkedIn", href: "https://www.linkedin.com" },
    { label: "X / Twitter", href: "https://x.com" },
    { label: "GitHub", href: "https://github.com" },
  ],
  copyright: "© 2026 huntFlow. All rights reserved.",
};
