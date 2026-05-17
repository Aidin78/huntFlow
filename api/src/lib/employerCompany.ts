export const employerCompanySelect = {
  id: true,
  name: true,
  tagline: true,
  website: true,
  linkedin: true,
  locations: true,
  about: true,
} as const;

export type EmployerCompanyRow = {
  id: string;
  name: string;
  tagline: string | null;
  website: string | null;
  linkedin: string | null;
  locations: string | null;
  about: string | null;
};

export function isCompanyProfileComplete(company: EmployerCompanyRow | null | undefined): boolean {
  if (!company) return false;
  const name = company.name?.trim();
  const tagline = company.tagline?.trim();
  const about = company.about?.trim();
  return Boolean(name && tagline && about && about.length >= 20);
}
