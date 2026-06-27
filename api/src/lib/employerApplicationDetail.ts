import { userFileDto } from './userFileDto';
import { displayCompanyName } from './manualApplication';

export const employerApplicationDetailSelect = {
  id: true,
  title: true,
  status: true,
  appliedAt: true,
  coverLetter: true,
  notes: true,
  location: true,
  salaryText: true,
  jobListingId: true,
  createdAt: true,
  updatedAt: true,
  company: { select: { id: true, name: true } },
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
  statusEvents: {
    orderBy: { at: 'desc' as const },
    take: 15,
    select: { from: true, to: true, at: true, note: true },
  },
  links: {
    orderBy: { createdAt: 'asc' as const },
    select: { id: true, label: true, url: true, createdAt: true },
  },
  contacts: {
    orderBy: { createdAt: 'asc' as const },
    select: {
      role: true,
      createdAt: true,
      contact: {
        select: {
          id: true,
          name: true,
          title: true,
          email: true,
          phone: true,
          linkedin: true,
          notes: true,
        },
      },
    },
  },
  attachments: {
    orderBy: { createdAt: 'desc' as const },
    select: {
      id: true,
      filename: true,
      mimeType: true,
      sizeBytes: true,
      notes: true,
      createdAt: true,
    },
  },
  tags: {
    select: { tag: { select: { id: true, name: true, color: true } } },
    orderBy: { tag: { name: 'asc' as const } },
  },
} as const;

export function mapEmployerApplicationDetail(row: {
  id: string;
  title: string;
  status: string;
  appliedAt: Date | null;
  coverLetter: string | null;
  notes: string | null;
  location: string | null;
  salaryText: string | null;
  jobListingId: string | null;
  createdAt: Date;
  updatedAt: Date;
  company: { id: string; name: string };
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
  statusEvents: Array<{
    from: string | null;
    to: string;
    at: Date;
    note: string | null;
  }>;
  links: Array<{ id: string; label: string | null; url: string; createdAt: Date }>;
  contacts: Array<{
    role: string | null;
    createdAt: Date;
    contact: {
      id: string;
      name: string;
      title: string | null;
      email: string | null;
      phone: string | null;
      linkedin: string | null;
      notes: string | null;
    };
  }>;
  attachments: Array<{
    id: string;
    filename: string;
    mimeType: string | null;
    sizeBytes: number | null;
    notes: string | null;
    createdAt: Date;
  }>;
  tags: Array<{ tag: { id: string; name: string; color: string | null } }>;
}) {
  const lastMessage = row.thread?.messages[0];
  const isManual = row.jobListingId == null;
  const jobPostingLink = row.links.find((l) => l.label === 'Job posting');
  return {
    application: {
      id: row.id,
      title: row.title,
      status: row.status,
      appliedAt: row.appliedAt?.toISOString() ?? null,
      coverLetter: row.coverLetter,
      notes: row.notes,
      location: row.location,
      salaryText: row.salaryText,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      isManual,
    },
    company: {
      id: row.company.id,
      name: displayCompanyName(row.company.name),
    },
    sourceUrl: jobPostingLink?.url ?? null,
    links: row.links.map((link) => ({
      id: link.id,
      label: link.label,
      url: link.url,
      createdAt: link.createdAt.toISOString(),
    })),
    contacts: row.contacts.map((entry) => ({
      id: entry.contact.id,
      applicationId: row.id,
      role: entry.role,
      name: entry.contact.name,
      title: entry.contact.title,
      email: entry.contact.email,
      phone: entry.contact.phone,
      linkedin: entry.contact.linkedin,
      notes: entry.contact.notes,
      createdAt: entry.createdAt.toISOString(),
    })),
    attachments: row.attachments.map((attachment) => ({
      id: attachment.id,
      applicationId: row.id,
      filename: attachment.filename,
      mimeType: attachment.mimeType,
      sizeBytes: attachment.sizeBytes,
      notes: attachment.notes,
      createdAt: attachment.createdAt.toISOString(),
    })),
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
    statusHistory: row.statusEvents.map((e) => ({
      from: e.from,
      to: e.to,
      at: e.at.toISOString(),
      note: e.note,
    })),
    tags: row.tags.map((entry) => entry.tag),
  };
}
