import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Login password for all demo accounts: Demo1234! */
const DEMO_PASSWORD_HASH = '$2b$10$0a0Nzky6Tk6GKM6MAqFosOA4AXYpXvNn/32pE3QkLe204CQ4VzlIm';

const demoCompanyNames = [
  '[huntFlow demo] Aurora Analytics',
  '[huntFlow demo] Blue River Systems',
  '[huntFlow demo] Coastal Health',
];

const companyProfiles = {
  [demoCompanyNames[0]]: {
    tagline: 'Analytics infrastructure for modern product teams',
    website: 'https://example.com/aurora-analytics',
    locations: 'Berlin · Remote EU',
    about:
      'Aurora Analytics builds data platforms for high-growth SaaS companies. We value clear APIs, strong ownership, and humane on-call.',
  },
  [demoCompanyNames[1]]: {
    tagline: 'Software that helps teams ship with confidence',
    website: 'https://example.com/blue-river',
    locations: 'London · Amsterdam',
    about:
      'Blue River Systems designs and ships B2B tools for engineering and product teams across Europe and North America.',
  },
  [demoCompanyNames[2]]: {
    tagline: 'Digital health products with clinical rigour',
    website: 'https://example.com/coastal-health',
    locations: 'Bristol · Hybrid UK',
    about:
      'Coastal Health builds regulated healthcare software. Our engineers work closely with clinicians and compliance specialists.',
  },
};

const listings = [
  {
    title: 'Senior Backend Engineer',
    summary: 'Design APIs and data pipelines for our analytics platform.',
    city: 'Berlin',
    workArrangement: 'HYBRID',
    experienceLevel: 'SENIOR',
    salaryText: '€90k–€115k',
    companyName: demoCompanyNames[0],
  },
  {
    title: 'Product Designer',
    summary: 'End-to-end product design for web and mobile.',
    city: 'London',
    workArrangement: 'ONSITE',
    experienceLevel: 'MID',
    salaryText: '£55k–£72k',
    companyName: demoCompanyNames[1],
  },
  {
    title: 'DevOps Engineer',
    summary: 'Kubernetes, CI/CD, and cloud infrastructure.',
    city: null,
    workArrangement: 'REMOTE',
    experienceLevel: 'MID',
    salaryText: '$120k–$150k',
    companyName: demoCompanyNames[0],
  },
  {
    title: 'Frontend Developer (React)',
    summary: 'Build accessible UI with React and TypeScript.',
    city: 'Amsterdam',
    workArrangement: 'HYBRID',
    experienceLevel: 'ENTRY',
    salaryText: '€48k–€62k',
    companyName: demoCompanyNames[1],
  },
  {
    title: 'Data Analyst',
    summary: 'SQL, dashboards, and experimentation.',
    city: 'Manchester',
    workArrangement: 'ONSITE',
    experienceLevel: 'ENTRY',
    salaryText: '£32k–£40k',
    companyName: demoCompanyNames[0],
  },
  {
    title: 'Engineering Manager',
    summary: 'Lead a platform team; strong people leadership.',
    city: 'London',
    workArrangement: 'HYBRID',
    experienceLevel: 'LEAD',
    salaryText: '£95k–£120k',
    companyName: demoCompanyNames[1],
  },
  {
    title: 'Security Engineer',
    summary: 'AppSec reviews, threat modelling, and tooling.',
    city: null,
    workArrangement: 'REMOTE',
    experienceLevel: 'SENIOR',
    salaryText: '$140k–$175k',
    companyName: demoCompanyNames[1],
  },
  {
    title: 'Clinical Software Engineer',
    summary: 'Regulated healthcare software; TypeScript and APIs.',
    city: 'Bristol',
    workArrangement: 'HYBRID',
    experienceLevel: 'MID',
    salaryText: '£58k–£70k',
    companyName: demoCompanyNames[2],
  },
  {
    title: 'Intern — Software Engineering',
    summary: 'Summer internship; pair with mentors on real features.',
    city: 'Berlin',
    workArrangement: 'ONSITE',
    experienceLevel: 'INTERN',
    salaryText: 'Paid internship',
    companyName: demoCompanyNames[0],
  },
];

const demoUsers = [
  {
    email: 'employer@demo.huntflow.app',
    name: 'Jordan Blake',
    role: 'EMPLOYER',
    companyName: demoCompanyNames[0],
  },
  { email: 'alex.morgan@demo.huntflow.app', name: 'Alex Morgan', role: 'JOB_SEEKER' },
  { email: 'samira.patel@demo.huntflow.app', name: 'Samira Patel', role: 'JOB_SEEKER' },
  { email: 'lucas.berg@demo.huntflow.app', name: 'Lucas Berg', role: 'JOB_SEEKER' },
  { email: 'mia.chen@demo.huntflow.app', name: 'Mia Chen', role: 'JOB_SEEKER' },
  { email: 'noah.okonkwo@demo.huntflow.app', name: 'Noah Okonkwo', role: 'JOB_SEEKER' },
  { email: 'elena.ruiz@demo.huntflow.app', name: 'Elena Ruiz', role: 'JOB_SEEKER' },
  { email: 'james.wright@demo.huntflow.app', name: 'James Wright', role: 'JOB_SEEKER' },
];

/** seeker email → listing title @ company */
const sampleApplications = [
  {
    seekerEmail: 'alex.morgan@demo.huntflow.app',
    listingTitle: 'Senior Backend Engineer',
    companyName: demoCompanyNames[0],
    status: 'APPLIED',
    daysAgo: 1,
  },
  {
    seekerEmail: 'samira.patel@demo.huntflow.app',
    listingTitle: 'Senior Backend Engineer',
    companyName: demoCompanyNames[0],
    status: 'INTERVIEW',
    daysAgo: 4,
  },
  {
    seekerEmail: 'lucas.berg@demo.huntflow.app',
    listingTitle: 'Senior Backend Engineer',
    companyName: demoCompanyNames[0],
    status: 'REJECTED',
    daysAgo: 12,
  },
  {
    seekerEmail: 'mia.chen@demo.huntflow.app',
    listingTitle: 'DevOps Engineer',
    companyName: demoCompanyNames[0],
    status: 'APPLIED',
    daysAgo: 2,
  },
  {
    seekerEmail: 'noah.okonkwo@demo.huntflow.app',
    listingTitle: 'DevOps Engineer',
    companyName: demoCompanyNames[0],
    status: 'INTERVIEW',
    daysAgo: 6,
  },
  {
    seekerEmail: 'elena.ruiz@demo.huntflow.app',
    listingTitle: 'Data Analyst',
    companyName: demoCompanyNames[0],
    status: 'APPLIED',
    daysAgo: 3,
  },
  {
    seekerEmail: 'james.wright@demo.huntflow.app',
    listingTitle: 'Data Analyst',
    companyName: demoCompanyNames[0],
    status: 'OFFER',
    daysAgo: 9,
  },
  {
    seekerEmail: 'alex.morgan@demo.huntflow.app',
    listingTitle: 'Intern — Software Engineering',
    companyName: demoCompanyNames[0],
    status: 'APPLIED',
    daysAgo: 5,
  },
  {
    seekerEmail: 'samira.patel@demo.huntflow.app',
    listingTitle: 'Product Designer',
    companyName: demoCompanyNames[1],
    status: 'APPLIED',
    daysAgo: 2,
  },
  {
    seekerEmail: 'lucas.berg@demo.huntflow.app',
    listingTitle: 'Product Designer',
    companyName: demoCompanyNames[1],
    status: 'INTERVIEW',
    daysAgo: 7,
  },
  {
    seekerEmail: 'mia.chen@demo.huntflow.app',
    listingTitle: 'Frontend Developer (React)',
    companyName: demoCompanyNames[1],
    status: 'APPLIED',
    daysAgo: 1,
  },
  {
    seekerEmail: 'noah.okonkwo@demo.huntflow.app',
    listingTitle: 'Frontend Developer (React)',
    companyName: demoCompanyNames[1],
    status: 'APPLIED',
    daysAgo: 3,
  },
  {
    seekerEmail: 'elena.ruiz@demo.huntflow.app',
    listingTitle: 'Engineering Manager',
    companyName: demoCompanyNames[1],
    status: 'INTERVIEW',
    daysAgo: 8,
  },
  {
    seekerEmail: 'james.wright@demo.huntflow.app',
    listingTitle: 'Security Engineer',
    companyName: demoCompanyNames[1],
    status: 'APPLIED',
    daysAgo: 4,
  },
  {
    seekerEmail: 'alex.morgan@demo.huntflow.app',
    listingTitle: 'Security Engineer',
    companyName: demoCompanyNames[1],
    status: 'REJECTED',
    daysAgo: 14,
  },
  {
    seekerEmail: 'samira.patel@demo.huntflow.app',
    listingTitle: 'Clinical Software Engineer',
    companyName: demoCompanyNames[2],
    status: 'APPLIED',
    daysAgo: 2,
  },
  {
    seekerEmail: 'lucas.berg@demo.huntflow.app',
    listingTitle: 'Clinical Software Engineer',
    companyName: demoCompanyNames[2],
    status: 'INTERVIEW',
    daysAgo: 5,
  },
  {
    seekerEmail: 'mia.chen@demo.huntflow.app',
    listingTitle: 'Clinical Software Engineer',
    companyName: demoCompanyNames[2],
    status: 'OFFER',
    daysAgo: 10,
  },
  {
    seekerEmail: 'noah.okonkwo@demo.huntflow.app',
    listingTitle: 'Engineering Manager',
    companyName: demoCompanyNames[1],
    status: 'APPLIED',
    daysAgo: 6,
  },
  {
    seekerEmail: 'elena.ruiz@demo.huntflow.app',
    listingTitle: 'Intern — Software Engineering',
    companyName: demoCompanyNames[0],
    status: 'APPLIED',
    daysAgo: 8,
  },
];

function daysAgoDate(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function locationForListing(listing) {
  const parts = [listing.city, listing.workArrangement].filter(Boolean);
  return parts.length ? parts.join(' · ') : null;
}

async function upsertCompanies() {
  const companies = {};
  for (const name of demoCompanyNames) {
    const profile = companyProfiles[name] ?? {};
    companies[name] = await prisma.company.upsert({
      where: { name },
      create: { name, ...profile },
      update: profile,
    });
  }
  return companies;
}

async function upsertListings(companies) {
  let created = 0;
  for (const row of listings) {
    const company = companies[row.companyName];
    if (!company) continue;

    const existing = await prisma.jobListing.findFirst({
      where: { companyId: company.id, title: row.title },
    });
    if (existing) continue;

    await prisma.jobListing.create({
      data: {
        title: row.title,
        summary: row.summary,
        city: row.city,
        workArrangement: row.workArrangement,
        experienceLevel: row.experienceLevel,
        salaryText: row.salaryText,
        companyId: company.id,
        isActive: true,
        publishedAt: daysAgoDate(Math.floor(Math.random() * 20) + 1),
      },
    });
    created += 1;
  }
  return created;
}

async function upsertUsers(companies) {
  const usersByEmail = {};
  for (const row of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: row.email },
      create: {
        email: row.email,
        name: row.name,
        role: row.role,
        passwordHash: DEMO_PASSWORD_HASH,
      },
      update: {
        name: row.name,
        role: row.role,
      },
    });
    usersByEmail[row.email] = user;

    if (row.role === 'EMPLOYER' && row.companyName) {
      const company = companies[row.companyName];
      if (company) {
        await prisma.employerProfile.upsert({
          where: { userId: user.id },
          create: { userId: user.id, companyId: company.id },
          update: { companyId: company.id },
        });
      }
    }
  }
  return usersByEmail;
}

async function listingIndex(companies) {
  const index = new Map();
  for (const name of demoCompanyNames) {
    const company = companies[name];
    if (!company) continue;
    const rows = await prisma.jobListing.findMany({
      where: { companyId: company.id },
      select: { id: true, title: true, city: true, workArrangement: true, salaryText: true, companyId: true },
    });
    for (const row of rows) {
      index.set(`${name}::${row.title}`, row);
    }
  }
  return index;
}

async function seedApplications(usersByEmail, companies, listingIdx) {
  let created = 0;
  let skipped = 0;

  for (const row of sampleApplications) {
    const user = usersByEmail[row.seekerEmail];
    const listing = listingIdx.get(`${row.companyName}::${row.listingTitle}`);
    if (!user || !listing) {
      skipped += 1;
      continue;
    }

    const existing = await prisma.jobApplication.findFirst({
      where: { userId: user.id, jobListingId: listing.id },
    });
    if (existing) {
      skipped += 1;
      continue;
    }

    const appliedAt = daysAgoDate(row.daysAgo);

    await prisma.jobApplication.create({
      data: {
        title: listing.title,
        status: row.status,
        appliedAt,
        location: locationForListing(listing),
        salaryText: listing.salaryText,
        userId: user.id,
        companyId: listing.companyId,
        jobListingId: listing.id,
        statusEvents: {
          create: {
            from: null,
            to: row.status,
            at: appliedAt,
            note: 'Seeded demo application',
          },
        },
      },
    });
    created += 1;
  }

  return { created, skipped };
}

async function main() {
  const companies = await upsertCompanies();
  const listingsCreated = await upsertListings(companies);
  const usersByEmail = await upsertUsers(companies);
  const listingIdx = await listingIndex(companies);
  const { created: applicationsCreated, skipped: applicationsSkipped } = await seedApplications(
    usersByEmail,
    companies,
    listingIdx,
  );

  // eslint-disable-next-line no-console
  console.log('huntFlow demo seed complete.');
  // eslint-disable-next-line no-console
  console.log(`  Companies: ${demoCompanyNames.length}`);
  // eslint-disable-next-line no-console
  console.log(`  New job listings: ${listingsCreated}`);
  // eslint-disable-next-line no-console
  console.log(`  Demo users: ${demoUsers.length} (password for all: Demo1234!)`);
  // eslint-disable-next-line no-console
  console.log(`  New applications: ${applicationsCreated} (${applicationsSkipped} already existed / skipped)`);
  // eslint-disable-next-line no-console
  console.log('');
  // eslint-disable-next-line no-console
  console.log('  Employer login: employer@demo.huntflow.app');
  // eslint-disable-next-line no-console
  console.log('  Job seeker login: alex.morgan@demo.huntflow.app (and other *@demo.huntflow.app seekers)');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
