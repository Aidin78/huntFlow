import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const demoCompanyNames = [
  '[huntFlow demo] Aurora Analytics',
  '[huntFlow demo] Blue River Systems',
  '[huntFlow demo] Coastal Health',
];

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

async function main() {
  const companies = {};
  for (const name of demoCompanyNames) {
    companies[name] = await prisma.company.upsert({
      where: { name },
      create: { name },
      update: {},
    });
  }

  const existing = await prisma.jobListing.count({
    where: { company: { name: { in: demoCompanyNames } } },
  });
  if (existing > 0) {
    // eslint-disable-next-line no-console
    console.log('Demo job listings already present; skipping seed.');
    return;
  }

  for (const row of listings) {
    const company = companies[row.companyName];
    if (!company) continue;
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
        publishedAt: new Date(),
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log(`Seeded ${listings.length} demo job listings.`);
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
