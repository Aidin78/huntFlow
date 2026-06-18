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

const seekerProfiles = {
  'alex.morgan@demo.huntflow.app': {
    headline: 'Backend engineer · Go & PostgreSQL',
    bio: 'Five years building APIs and data pipelines. Interested in platform teams and strong engineering culture.',
    phone: '+49 170 1234567',
    location: 'Berlin',
    linkedinUrl: 'https://linkedin.com/in/alex-morgan-demo',
    portfolioUrl: 'https://example.com/alex-morgan',
    githubUrl: 'https://github.com/alexmorgan-demo',
  },
  'samira.patel@demo.huntflow.app': {
    headline: 'Full-stack developer · React & Node',
    bio: 'Product-minded engineer who enjoys shipping end-to-end features and mentoring juniors.',
    location: 'London',
    linkedinUrl: 'https://linkedin.com/in/samira-patel-demo',
    githubUrl: 'https://github.com/samirapatel-demo',
  },
  'lucas.berg@demo.huntflow.app': {
    headline: 'Platform engineer · Kubernetes',
    bio: 'DevOps-focused developer with experience in regulated industries and on-call rotation.',
    location: 'Amsterdam',
    linkedinUrl: 'https://linkedin.com/in/lucas-berg-demo',
  },
  'mia.chen@demo.huntflow.app': {
    headline: 'Frontend engineer · React & accessibility',
    bio: 'I care about inclusive UI, design systems, and measurable performance improvements.',
    location: 'Manchester',
    portfolioUrl: 'https://example.com/mia-chen',
    githubUrl: 'https://github.com/miachen-demo',
  },
  'noah.okonkwo@demo.huntflow.app': {
    headline: 'Data analyst → analytics engineer',
    bio: 'SQL, dbt, and experimentation. Looking for teams that treat data as a product.',
    location: 'Remote (EU)',
    linkedinUrl: 'https://linkedin.com/in/noah-okonkwo-demo',
  },
  'elena.ruiz@demo.huntflow.app': {
    headline: 'Engineering manager · B2B SaaS',
    bio: 'Former IC lead now focused on hiring, delivery, and healthy team habits.',
    location: 'London',
    linkedinUrl: 'https://linkedin.com/in/elena-ruiz-demo',
  },
  'james.wright@demo.huntflow.app': {
    headline: 'Security engineer · AppSec',
    bio: 'Threat modelling, secure SDLC, and developer-friendly security tooling.',
    location: 'Remote (UK)',
    githubUrl: 'https://github.com/jameswright-demo',
  },
};

const coverLettersByKey = {
  'alex.morgan@demo.huntflow.app::[huntFlow demo] Aurora Analytics::Senior Backend Engineer':
    'Hi Aurora team,\n\nI have spent the last several years on Go services and Postgres at scale. Your analytics platform work aligns well with what I enjoy building.\n\nBest,\nAlex',
  'samira.patel@demo.huntflow.app::[huntFlow demo] Aurora Analytics::Senior Backend Engineer':
    'Hello,\n\nI am excited about the Senior Backend role. I would welcome a conversation about your API roadmap and team structure.\n\nSamira',
  'james.wright@demo.huntflow.app::[huntFlow demo] Aurora Analytics::Data Analyst':
    'Dear hiring team,\n\nMy background blends security reviews with data tooling — happy to share how I approach sensitive datasets responsibly.\n\nJames',
};

const demoMessageThreads = [
  {
    seekerEmail: 'samira.patel@demo.huntflow.app',
    listingTitle: 'Senior Backend Engineer',
    companyName: demoCompanyNames[0],
    messages: [
      {
        from: 'employer',
        body: 'Thanks for applying, Samira. Are you available for a 30-minute intro call next week?',
        hoursAgo: 48,
      },
      {
        from: 'seeker',
        body: 'Hi Jordan — yes, I am free Tuesday or Wednesday afternoon CET. Looking forward to it.',
        hoursAgo: 40,
      },
    ],
  },
  {
    seekerEmail: 'alex.morgan@demo.huntflow.app',
    listingTitle: 'Senior Backend Engineer',
    companyName: demoCompanyNames[0],
    messages: [
      {
        from: 'seeker',
        body: 'Quick question: is the team mostly Berlin-based or distributed across EU time zones?',
        hoursAgo: 20,
      },
      {
        from: 'employer',
        body: 'Mostly hybrid in Berlin with a few remote colleagues in CET±1. Happy to discuss on a call.',
        hoursAgo: 12,
      },
    ],
  },
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

function hoursAgoDate(hours) {
  const d = new Date();
  d.setTime(d.getTime() - hours * 60 * 60 * 1000);
  return d;
}

function daysFromNowDate(days, hour = 10) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

function applicationKey(seekerEmail, companyName, listingTitle) {
  return `${seekerEmail}::${companyName}::${listingTitle}`;
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
        notificationPreferences: { create: {} },
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

    await prisma.userNotificationPreferences.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });
  }
  return usersByEmail;
}

async function seedSeekerProfiles(usersByEmail) {
  let upserted = 0;
  for (const [email, profile] of Object.entries(seekerProfiles)) {
    const user = usersByEmail[email];
    if (!user) continue;
    await prisma.jobSeekerProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...profile },
      update: profile,
    });
    upserted += 1;
  }
  return upserted;
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
    const key = applicationKey(row.seekerEmail, row.companyName, row.listingTitle);
    const coverLetter = coverLettersByKey[key] ?? null;

    await prisma.jobApplication.create({
      data: {
        title: listing.title,
        status: row.status,
        appliedAt,
        coverLetter,
        location: locationForListing(listing),
        salaryText: listing.salaryText,
        userId: user.id,
        companyId: listing.companyId,
        jobListingId: listing.id,
        thread: { create: {} },
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

async function backfillApplicationThreads() {
  const missing = await prisma.jobApplication.findMany({
    where: { thread: null },
    select: { id: true },
  });
  for (const app of missing) {
    await prisma.applicationThread.create({ data: { jobApplicationId: app.id } });
  }
  return missing.length;
}

async function seedDemoMessages(usersByEmail, listingIdx) {
  const employer = usersByEmail['employer@demo.huntflow.app'];
  if (!employer) return 0;

  let created = 0;
  for (const row of demoMessageThreads) {
    const seeker = usersByEmail[row.seekerEmail];
    const listing = listingIdx.get(`${row.companyName}::${row.listingTitle}`);
    if (!seeker || !listing) continue;

    const application = await prisma.jobApplication.findFirst({
      where: { userId: seeker.id, jobListingId: listing.id },
      select: { id: true, thread: { select: { id: true } } },
    });
    if (!application?.thread) continue;

    const existingCount = await prisma.applicationMessage.count({
      where: { threadId: application.thread.id },
    });
    if (existingCount > 0) continue;

    for (const msg of row.messages) {
      const senderUserId = msg.from === 'employer' ? employer.id : seeker.id;
      await prisma.applicationMessage.create({
        data: {
          threadId: application.thread.id,
          senderUserId,
          body: msg.body,
          createdAt: hoursAgoDate(msg.hoursAgo),
        },
      });
      created += 1;
    }
  }
  return created;
}

async function backfillCoverLetters() {
  let updated = 0;
  for (const [key, coverLetter] of Object.entries(coverLettersByKey)) {
    const [seekerEmail, companyName, listingTitle] = key.split('::');
    const user = await prisma.user.findUnique({ where: { email: seekerEmail } });
    if (!user) continue;
    const listing = await prisma.jobListing.findFirst({
      where: { title: listingTitle, company: { name: companyName } },
      select: { id: true },
    });
    if (!listing) continue;
    const app = await prisma.jobApplication.findFirst({
      where: { userId: user.id, jobListingId: listing.id },
    });
    if (!app || app.coverLetter) continue;
    await prisma.jobApplication.update({
      where: { id: app.id },
      data: { coverLetter },
    });
    updated += 1;
  }
  return updated;
}

async function seedDemoNotifications(usersByEmail, listingIdx) {
  const employer = usersByEmail['employer@demo.huntflow.app'];
  const seeker = usersByEmail['alex.morgan@demo.huntflow.app'];
  if (!employer) return 0;

  let created = 0;

  const listing = listingIdx.get(`${demoCompanyNames[0]}::Senior Backend Engineer`);
  if (listing && seeker) {
    const application = await prisma.jobApplication.findFirst({
      where: { userId: seeker.id, jobListingId: listing.id },
      select: { id: true },
    });
    if (application) {
      const existing = await prisma.notification.count({
        where: { recipientUserId: employer.id, jobApplicationId: application.id, type: 'NEW_APPLICATION' },
      });
      if (existing === 0) {
        await prisma.notification.create({
          data: {
            type: 'NEW_APPLICATION',
            title: 'New application: Senior Backend Engineer',
            body: `${seeker.name ?? seeker.email} applied to this role.`,
            recipientUserId: employer.id,
            actorUserId: seeker.id,
            jobApplicationId: application.id,
          },
        });
        created += 1;
      }

      if (seeker) {
        const existingMsg = await prisma.notification.count({
          where: { recipientUserId: seeker.id, jobApplicationId: application.id, type: 'MESSAGE' },
        });
        if (existingMsg === 0) {
          await prisma.notification.create({
            data: {
              type: 'MESSAGE',
              title: `New message from ${employer.name ?? employer.email}`,
              body: 'Thanks for applying — we would like to schedule a short intro call.',
              recipientUserId: seeker.id,
              actorUserId: employer.id,
              jobApplicationId: application.id,
            },
          });
          created += 1;
        }
      }
    }
  }

  return created;
}

async function seedDemoSchedule(usersByEmail, listingIdx) {
  const seeker = usersByEmail['alex.morgan@demo.huntflow.app'];
  if (!seeker) return { interviews: 0, reminders: 0 };

  let interviews = 0;
  let reminders = 0;

  const targets = [
    { listingTitle: 'Senior Backend Engineer', companyName: demoCompanyNames[0] },
    { listingTitle: 'Intern — Software Engineering', companyName: demoCompanyNames[0] },
  ];

  for (const target of targets) {
    const listing = listingIdx.get(`${target.companyName}::${target.listingTitle}`);
    if (!listing) continue;

    const application = await prisma.jobApplication.findFirst({
      where: { userId: seeker.id, jobListingId: listing.id },
      select: { id: true },
    });
    if (!application) continue;

    const existingInterview = await prisma.interview.count({
      where: { jobApplicationId: application.id },
    });
    if (existingInterview === 0) {
      await prisma.interview.create({
        data: {
          jobApplicationId: application.id,
          title: target.listingTitle.includes('Intern') ? 'HR screen' : 'Technical interview',
          scheduledAt: daysFromNowDate(target.listingTitle.includes('Intern') ? 5 : 3, 14),
          durationMinutes: 45,
          location: 'Zoom',
          notes: 'Demo seeded interview',
        },
      });
      interviews += 1;
    }

    const existingReminder = await prisma.reminder.count({
      where: { jobApplicationId: application.id },
    });
    if (existingReminder === 0) {
      await prisma.reminder.create({
        data: {
          jobApplicationId: application.id,
          title: 'Follow up with recruiter',
          remindAt: daysFromNowDate(-1, 9),
          status: 'PENDING',
          notes: 'Demo overdue reminder',
        },
      });
      reminders += 1;
    }
  }

  return { interviews, reminders };
}

async function seedDemoTags(usersByEmail, listingIdx) {
  const seeker = usersByEmail['alex.morgan@demo.huntflow.app'];
  if (!seeker) return { tags: 0, links: 0 };

  const tagDefs = [
    { name: 'Remote', color: '#2563eb' },
    { name: 'Priority', color: '#db2777' },
    { name: 'Referral', color: '#0d9488' },
  ];

  const tagsByName = {};
  let tagsCreated = 0;
  let linksCreated = 0;

  for (const def of tagDefs) {
    const tag = await prisma.tag.upsert({
      where: { userId_name: { userId: seeker.id, name: def.name } },
      create: { userId: seeker.id, name: def.name, color: def.color },
      update: { color: def.color },
    });
    tagsByName[def.name] = tag;
    tagsCreated += 1;
  }

  const attachTargets = [
    { listingTitle: 'Senior Backend Engineer', companyName: demoCompanyNames[0], tagNames: ['Remote', 'Priority'] },
    { listingTitle: 'Intern — Software Engineering', companyName: demoCompanyNames[0], tagNames: ['Referral'] },
  ];

  for (const target of attachTargets) {
    const listing = listingIdx.get(`${target.companyName}::${target.listingTitle}`);
    if (!listing) continue;

    const application = await prisma.jobApplication.findFirst({
      where: { userId: seeker.id, jobListingId: listing.id },
      select: { id: true },
    });
    if (!application) continue;

    for (const tagName of target.tagNames) {
      const tag = tagsByName[tagName];
      if (!tag) continue;
      await prisma.jobApplicationTag.upsert({
        where: {
          jobApplicationId_tagId: { jobApplicationId: application.id, tagId: tag.id },
        },
        create: { jobApplicationId: application.id, tagId: tag.id },
        update: {},
      });
      linksCreated += 1;
    }
  }

  return { tags: tagsCreated, links: linksCreated };
}

async function main() {
  const companies = await upsertCompanies();
  const listingsCreated = await upsertListings(companies);
  const usersByEmail = await upsertUsers(companies);
  const profilesUpserted = await seedSeekerProfiles(usersByEmail);
  const listingIdx = await listingIndex(companies);
  const { created: applicationsCreated, skipped: applicationsSkipped } = await seedApplications(
    usersByEmail,
    companies,
    listingIdx,
  );
  const threadsBackfilled = await backfillApplicationThreads();
  const coverLettersUpdated = await backfillCoverLetters();
  const messagesCreated = await seedDemoMessages(usersByEmail, listingIdx);
  const notificationsCreated = await seedDemoNotifications(usersByEmail, listingIdx);
  const { interviews: interviewsSeeded, reminders: remindersSeeded } = await seedDemoSchedule(
    usersByEmail,
    listingIdx,
  );
  const { tags: tagsSeeded, links: tagLinksSeeded } = await seedDemoTags(usersByEmail, listingIdx);

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
  console.log(`  Seeker profiles: ${profilesUpserted}`);
  // eslint-disable-next-line no-console
  console.log(`  Threads backfilled: ${threadsBackfilled}`);
  // eslint-disable-next-line no-console
  console.log(`  Cover letters updated: ${coverLettersUpdated}`);
  // eslint-disable-next-line no-console
  console.log(`  Demo messages created: ${messagesCreated}`);
  // eslint-disable-next-line no-console
  console.log(`  Demo notifications created: ${notificationsCreated}`);
  // eslint-disable-next-line no-console
  console.log(`  Demo interviews seeded: ${interviewsSeeded}`);
  // eslint-disable-next-line no-console
  console.log(`  Demo reminders seeded: ${remindersSeeded}`);
  // eslint-disable-next-line no-console
  console.log(`  Demo tags seeded: ${tagsSeeded} (${tagLinksSeeded} application links)`);
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
