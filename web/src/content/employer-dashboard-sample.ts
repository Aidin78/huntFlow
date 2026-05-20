/**
 * Static employer dashboard copy and sample data — replace with API later.
 */

export type EmployerNavItem = {
  id: string;
  label: string;
  href: string;
  description: string;
};

export const employerNavItems: EmployerNavItem[] = [
  {
    id: "overview",
    label: "Overview",
    href: "/dashboard/employer",
    description: "Hiring pulse and quick actions",
  },
  {
    id: "jobs",
    label: "Job postings",
    href: "/dashboard/employer/jobs",
    description: "Open roles you publish",
  },
  {
    id: "applications",
    label: "Applications",
    href: "/dashboard/employer/applications",
    description: "Candidates in your pipeline",
  },
  {
    id: "company",
    label: "Company profile",
    href: "/dashboard/employer/company",
    description: "Brand and careers page",
  },
  {
    id: "settings",
    label: "Settings",
    href: "/dashboard/employer/settings",
    description: "Account and notifications",
  },
];

export const employerOverview = {
  title: "Employer overview",
  subtitle: "Sample metrics and activity — live data will load from the API later.",
  stats: [
    { label: "Active postings", value: "4", change: "+1 this month" },
    { label: "New applications", value: "23", change: "12 awaiting review" },
    { label: "Interviews scheduled", value: "6", change: "Next: Tue 14:00" },
    { label: "Avg. time to first review", value: "1.8d", change: "↓ 0.3d vs last month" },
  ],
  quickActions: [
    { label: "Post a new role", href: "/dashboard/employer/jobs", primary: true },
    { label: "Review applications", href: "/dashboard/employer/applications", primary: false },
    { label: "Edit company profile", href: "/dashboard/employer/company", primary: false },
  ],
};

export type EmployerJobRow = {
  id: string;
  title: string;
  status: "Published" | "Draft" | "Closed";
  applicants: number;
  location: string;
  postedAt: string;
};

export const employerSampleJobs: EmployerJobRow[] = [
  {
    id: "1",
    title: "Senior Backend Engineer",
    status: "Published",
    applicants: 14,
    location: "Berlin · Hybrid",
    postedAt: "12 May 2026",
  },
  {
    id: "2",
    title: "Product Designer",
    status: "Published",
    applicants: 9,
    location: "London · On-site",
    postedAt: "8 May 2026",
  },
  {
    id: "3",
    title: "DevOps Engineer",
    status: "Draft",
    applicants: 0,
    location: "Remote",
    postedAt: "—",
  },
  {
    id: "4",
    title: "Engineering Manager",
    status: "Closed",
    applicants: 31,
    location: "London · Hybrid",
    postedAt: "1 Apr 2026",
  },
];

export type EmployerApplicantRow = {
  id: string;
  name: string;
  role: string;
  stage: "New" | "Screening" | "Interview" | "Offer" | "Rejected";
  appliedAt: string;
};

export const employerSampleApplicants: EmployerApplicantRow[] = [
  {
    id: "a1",
    name: "Samira H.",
    role: "Senior Backend Engineer",
    stage: "Interview",
    appliedAt: "15 May 2026",
  },
  {
    id: "a2",
    name: "James O.",
    role: "Product Designer",
    stage: "Screening",
    appliedAt: "14 May 2026",
  },
  {
    id: "a3",
    name: "Priya K.",
    role: "Senior Backend Engineer",
    stage: "New",
    appliedAt: "14 May 2026",
  },
  {
    id: "a4",
    name: "Alex M.",
    role: "Product Designer",
    stage: "Offer",
    appliedAt: "10 May 2026",
  },
];

export const employerCompanySample = {
  name: "Blue River Systems",
  tagline: "Infrastructure software for growing teams",
  website: "https://example.com",
  locations: "London, Berlin, Remote-first",
  about:
    "We build developer tools that help mid-size companies ship faster. Our careers page highlights hybrid roles and a transparent interview process.",
};

export const employerSettingsSample = {
  notifications: [
    { id: "new-app", label: "New applications", enabled: true },
    { id: "interview", label: "Interview reminders", enabled: true },
    { id: "weekly", label: "Weekly hiring summary", enabled: false },
  ],
};
