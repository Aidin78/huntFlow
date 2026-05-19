export type SeekerNavItem = {
  id: string;
  label: string;
  href: string;
  description: string;
  external?: boolean;
};

export const seekerNavItems: SeekerNavItem[] = [
  {
    id: "overview",
    label: "Overview",
    href: "/dashboard/seeker",
    description: "Your job search at a glance",
  },
  {
    id: "applications",
    label: "Applications",
    href: "/dashboard/seeker/applications",
    description: "Roles you have applied to",
  },
  {
    id: "jobs",
    label: "Browse jobs",
    href: "/jobs",
    description: "Open roles on the job board",
    external: true,
  },
  {
    id: "settings",
    label: "Settings",
    href: "/dashboard/seeker/settings",
    description: "Account preferences",
  },
];
