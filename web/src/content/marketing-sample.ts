/**
 * Sample English marketing copy — replace with CMS/API later.
 */

export type RoleTabId = "job_seeker" | "employer";

export type RolePathStep = { title: string; body: string };

export type FeatureItem = {
  title: string;
  description: string;
  icon: string;
};

export type WhyItem = { title: string; body: string };

export type SampleJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
};

export const marketingSections = {
  path: {
    title: "Your journey",
    subtitle:
      "Use the tabs to see how we prioritize job seekers today versus the employer experience we'll add next.",
    tablistAria: "Audience type",
  },
  features: {
    title: "Features",
    subtitle: "Highlights for both audiences—icons and copy stay as placeholders until the API is wired in.",
  },
  why: {
    title: "Why huntFlow?",
  },
  jobs: {
    title: "Sample listings",
    subtitle: "Cards are rendered from a static front-end array; they'll be fetched from the backend later.",
    saveDisabled: "Save sample (disabled)",
  },
  testimonials: {
    title: "What people say",
    subtitle: "Sample quotes for layout — later these load from an API or CMS.",
  },
};

export const marketingHeroDev = {
  devNote:
    "This page uses sample data and will load from the API later. The web app reads",
  devNoteSuffix: "(defaults to http://localhost:4000).",
};

/** Hero copy switches with Job seeker / Employer tabs (see `MarketingHero`). */
export const marketingHeroByAudience: Record<
  RoleTabId,
  { eyebrow: string; title: string; subtitle: string }
> = {
  job_seeker: {
    eyebrow: "For people who are hiring themselves into a new role",
    title: "Track every application in one calm pipeline.",
    subtitle:
      "Log roles, stages, notes, and follow-ups in one place—without losing context across spreadsheets, tabs, and inboxes.",
  },
  employer: {
    eyebrow: "For teams who are hiring for their company",
    title: "Post roles and keep candidates organised—on the same platform.",
    subtitle:
      "Employer workflows are rolling out next. Today you can still create an employer account so your team is ready when hiring tools go live.",
  },
};

export const marketingRolePaths: Record<
  RoleTabId,
  { label: string; headline: string; steps: RolePathStep[] }
> = {
  job_seeker: {
    label: "Job seeker",
    headline: "Recommended path for job seekers",
    steps: [
      {
        title: "Sign up and complete your profile",
        body: "Add basics and preferences—this step will connect to the API in a later iteration.",
      },
      {
        title: "Log each role and stage",
        body: "Track every posting with a status (applied, interview, offer, and so on).",
      },
      {
        title: "Reminders and follow-ups",
        body: "Schedule the next touchpoint so nothing slips through the cracks.",
      },
    ],
  },
  employer: {
    label: "Employer",
    headline: "Employer journey (coming next)",
    steps: [
      {
        title: "Publish roles",
        body: "Placeholder copy—later you'll post openings and manage applicants from the same platform.",
      },
      {
        title: "Review inbound applicants",
        body: "Mock data for now; backend integration comes in a later phase.",
      },
      {
        title: "Collaborate with your team",
        body: "Internal notes and per-candidate stage tracking for hiring teams.",
      },
    ],
  },
};

export const marketingFeatures: FeatureItem[] = [
  {
    icon: "◎",
    title: "Stage pipeline",
    description: "From draft to archived—each application has a clear home in the workflow.",
  },
  {
    icon: "✎",
    title: "Notes and history",
    description: "Capture calls and decisions in one timeline so context never disappears.",
  },
  {
    icon: "⏱",
    title: "Smart reminders",
    description: "Schedule the next follow-up so outreach stays consistent.",
  },
  {
    icon: "⚑",
    title: "Tags and filters",
    description: "Remote, comp band, stack—filters will load from the server when the API is ready.",
  },
];

export const marketingWhy: WhyItem[] = [
  {
    title: "Job seeker first",
    body: "Our near-term roadmap is a fast, obvious experience for people running several searches at once.",
  },
  {
    title: "Less fragmentation",
    body: "One source of truth for every company and role instead of tabs, files, and inbox threads.",
  },
  {
    title: "API-ready structure",
    body: "This page is static for now; the same shapes map cleanly to real endpoints when you ship them.",
  },
];

export const marketingSampleJobs: SampleJob[] = [
  {
    id: "1",
    title: "Frontend Engineer (React)",
    company: "Northline Labs",
    location: "London · Hybrid",
    salary: "£55k – £75k",
    type: "Full-time",
  },
  {
    id: "2",
    title: "Backend Engineer (Node.js)",
    company: "Riverstack",
    location: "Remote (UK)",
    salary: "Competitive",
    type: "Full-time",
  },
  {
    id: "3",
    title: "Product Analyst",
    company: "Camber",
    location: "Manchester",
    salary: "From £42k",
    type: "Contract",
  },
];

export const marketingTestimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "Before huntFlow I’d call the wrong company about the wrong stage. Now I always know exactly where I left things.",
    name: "Sarah M.",
    role: "Mobile developer",
  },
  {
    id: "t2",
    quote: "Still sample data, but the layout feels production-ready—I’m looking forward to wiring it to the API.",
    name: "Alex R.",
    role: "Security-focused job seeker",
  },
];

export const marketingFinalCta = {
  title: "Pick the account that matches how you use huntFlow.",
  subtitle:
    "Job seekers track applications; employers prepare for posting and pipeline tools. You can create one account per email—choose the right role up front.",
  jobSeekerButton: "Create job seeker account",
  employerButton: "Create employer account",
  signInLine: "Already registered?",
  signInLink: "Sign in and select the same audience.",
};

export const marketingFooter = {
  tagline: "huntFlow — a calmer pipeline for job seekers, with employer tools on the roadmap.",
  columns: [
    {
      title: "Product",
      links: [
        { label: "Your journey", href: "#path" },
        { label: "Features", href: "#features" },
        { label: "Why huntFlow?", href: "#why" },
        { label: "Sample listings", href: "#jobs" },
        { label: "Testimonials", href: "#testimonials" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Contact (sample)", href: "#" },
        { label: "FAQ (sample)", href: "#" },
        { label: "Status page (sample)", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy (sample)", href: "#" },
        { label: "Terms (sample)", href: "#" },
      ],
    },
  ],
  social: [
    { label: "LinkedIn", href: "#" },
    { label: "X / Twitter", href: "#" },
    { label: "GitHub", href: "#" },
  ],
  copyright: "© 2026 huntFlow — sample content.",
};
