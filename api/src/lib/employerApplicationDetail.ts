import { userFileDto } from './userFileDto';

export const employerApplicationDetailSelect = {
  id: true,
  title: true,
  status: true,
  appliedAt: true,
  coverLetter: true,
  location: true,
  salaryText: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      jobSeekerProfile: {
        select: {
          headline: true,
          bio: true,
          phone: true,
          location: true,
          linkedinUrl: true,
          portfolioUrl: true,
          githubUrl: true,
        },
      },
    },
  },
  jobListing: {
    select: {
      id: true,
      title: true,
      city: true,
      workArrangement: true,
      experienceLevel: true,
    },
  },
  resumeFile: {
    select: { id: true, filename: true, mimeType: true, sizeBytes: true, createdAt: true },
  },
  thread: {
    select: {
      _count: { select: { messages: true } },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' as const },
        select: { body: true, createdAt: true, sender: { select: { name: true, email: true } } },
      },
    },
  },
} as const;

export function mapEmployerApplicationDetail(row: {
  id: string;
  title: string;
  status: string;
  appliedAt: Date | null;
  coverLetter: string | null;
  location: string | null;
  salaryText: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    jobSeekerProfile: {
      headline: string | null;
      bio: string | null;
      phone: string | null;
      location: string | null;
      linkedinUrl: string | null;
      portfolioUrl: string | null;
      githubUrl: string | null;
    } | null;
  };
  jobListing: {
    id: string;
    title: string;
    city: string | null;
    workArrangement: string;
    experienceLevel: string;
  } | null;
  resumeFile: {
    id: string;
    filename: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: Date;
  } | null;
  thread: {
    _count: { messages: number };
    messages: Array<{
      body: string;
      createdAt: Date;
      sender: { name: string | null; email: string };
    }>;
  } | null;
}) {
  const lastMessage = row.thread?.messages[0];
  return {
    application: {
      id: row.id,
      title: row.title,
      status: row.status,
      appliedAt: row.appliedAt?.toISOString() ?? null,
      coverLetter: row.coverLetter,
      location: row.location,
      salaryText: row.salaryText,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    },
    applicant: {
      id: row.user.id,
      name: row.user.name,
      email: row.user.email,
      profile: row.user.jobSeekerProfile,
    },
    jobListing: row.jobListing,
    resume: row.resumeFile ? userFileDto(row.resumeFile) : null,
    messaging: {
      messageCount: row.thread?._count.messages ?? 0,
      lastMessage: lastMessage
        ? {
            body: lastMessage.body,
            createdAt: lastMessage.createdAt.toISOString(),
            senderName: lastMessage.sender.name ?? lastMessage.sender.email,
          }
        : null,
    },
  };
}
