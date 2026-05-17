import type { EmployerCompany } from "@/lib/employer-job-listings-api";

export const EMPLOYER_COMPANY_PATH = "/dashboard/employer/company";

export function isEmployerCompanyComplete(company: EmployerCompany | null | undefined): boolean {
  if (!company) return false;
  const name = company.name?.trim();
  const tagline = company.tagline?.trim();
  const about = company.about?.trim();
  return Boolean(name && tagline && about && about.length >= 20);
}

export type CompanyProfileChecklist = {
  name: boolean;
  tagline: boolean;
  about: boolean;
};

export function companyProfileChecklist(
  company: EmployerCompany | null | undefined,
): CompanyProfileChecklist {
  return {
    name: Boolean(company?.name?.trim()),
    tagline: Boolean(company?.tagline?.trim()),
    about: Boolean(company?.about?.trim() && company.about.trim().length >= 20),
  };
}
