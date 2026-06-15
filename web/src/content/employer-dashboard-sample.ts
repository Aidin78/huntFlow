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

export const employerCompanySample = {
  name: "Blue River Systems",
  tagline: "Infrastructure software for growing teams",
  website: "https://example.com",
  locations: "London, Berlin, Remote-first",
  about:
    "We build developer tools that help mid-size companies ship faster. Our careers page highlights hybrid roles and a transparent interview process.",
};
