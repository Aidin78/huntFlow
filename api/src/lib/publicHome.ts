import { prisma } from '@huntflow/db';

const DEMO_COMPANY_PREFIX = '[huntFlow demo] ';

export function displayPublicCompanyName(storedName: string): string {
  if (storedName.startsWith(DEMO_COMPANY_PREFIX)) {
    return storedName.slice(DEMO_COMPANY_PREFIX.length);
  }
  return storedName;
}

export type PublicHomeJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string | null;
  arrangement: string;
  publishedAt: string;
};

export type PublicHomeStats = {
  activeListings: number;
  hiringCompanies: number;
  workArrangements: string[];
};

export type PublicHomeData = {
  stats: PublicHomeStats;
  featuredJobs: PublicHomeJob[];
};

const listingSelect = {
  id: true,
  title: true,
  city: true,
  workArrangement: true,
  salaryText: true,
  publishedAt: true,
  company: { select: { name: true } },
} as const;

function formatLocation(city: string | null, workArrangement: string): string {
  const arrangement =
    workArrangement === 'REMOTE'
      ? 'Remote'
      : workArrangement === 'HYBRID'
        ? 'Hybrid'
        : 'On-site';
  if (city?.trim()) {
    return `${city.trim()} · ${arrangement}`;
  }
  return arrangement;
}

export async function getPublicHomeData(featuredLimit = 3): Promise<PublicHomeData> {
  const activeWhere = { isActive: true, publishedAt: { not: null } } as const;

  const [featuredRows, activeListings, companyGroups, arrangementGroups] = await Promise.all([
    prisma.jobListing.findMany({
      where: activeWhere,
      orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      take: featuredLimit,
      select: listingSelect,
    }),
    prisma.jobListing.count({ where: activeWhere }),
    prisma.jobListing.groupBy({
      by: ['companyId'],
      where: activeWhere,
      _count: { _all: true },
    }),
    prisma.jobListing.groupBy({
      by: ['workArrangement'],
      where: activeWhere,
      _count: { _all: true },
    }),
  ]);

  const featuredJobs: PublicHomeJob[] = featuredRows.map((row) => ({
    id: row.id,
    title: row.title,
    company: displayPublicCompanyName(row.company.name),
    location: formatLocation(row.city, row.workArrangement),
    salary: row.salaryText,
    arrangement: row.workArrangement,
    publishedAt: row.publishedAt!.toISOString(),
  }));

  return {
    stats: {
      activeListings,
      hiringCompanies: companyGroups.length,
      workArrangements: arrangementGroups.map((g) => g.workArrangement).sort(),
    },
    featuredJobs,
  };
}
