import { prisma, UserRole, type JobApplicationStatus } from '@huntflow/db';

import { getEmployerApplication, getSeekerApplication } from './applicationAccess';
import { notifyApplicationStatusChange } from './notifications';

export const EMPLOYER_ALLOWED_STATUSES = ['INTERVIEW', 'OFFER', 'REJECTED'] as const;
export const SEEKER_ALLOWED_STATUSES = ['ARCHIVED'] as const;

export type EmployerAllowedStatus = (typeof EMPLOYER_ALLOWED_STATUSES)[number];
export type SeekerAllowedStatus = (typeof SEEKER_ALLOWED_STATUSES)[number];

export type UpdateApplicationStatusInput = {
  applicationId: string;
  actorUserId: string;
  actorRole: UserRole;
  toStatus: JobApplicationStatus;
  note?: string | null;
};

export type UpdateApplicationStatusResult =
  | {
      ok: true;
      application: { id: string; status: JobApplicationStatus; updatedAt: string };
      event: { from: JobApplicationStatus | null; to: JobApplicationStatus; at: string; note: string | null };
    }
  | { ok: false; code: 'NOT_FOUND' | 'FORBIDDEN' | 'VALIDATION_ERROR'; message: string };

function isEmployerStatus(status: JobApplicationStatus): status is EmployerAllowedStatus {
  return (EMPLOYER_ALLOWED_STATUSES as readonly string[]).includes(status);
}

function isSeekerStatus(status: JobApplicationStatus): status is SeekerAllowedStatus {
  return (SEEKER_ALLOWED_STATUSES as readonly string[]).includes(status);
}

export async function updateApplicationStatus(
  input: UpdateApplicationStatusInput,
): Promise<UpdateApplicationStatusResult> {
  const { applicationId, actorUserId, actorRole, toStatus, note } = input;

  if (toStatus === 'DRAFT') {
    return { ok: false, code: 'FORBIDDEN', message: 'This status cannot be set' };
  }

  if (actorRole === UserRole.EMPLOYER) {
    if (!isEmployerStatus(toStatus)) {
      return { ok: false, code: 'FORBIDDEN', message: 'Employers can only set Interview, Offer, or Rejected' };
    }
  } else if (actorRole === UserRole.JOB_SEEKER) {
    if (!isSeekerStatus(toStatus)) {
      return { ok: false, code: 'FORBIDDEN', message: 'Job seekers can only archive applications' };
    }
  } else {
    return { ok: false, code: 'FORBIDDEN', message: 'Not allowed' };
  }

  const access =
    actorRole === UserRole.EMPLOYER
      ? await getEmployerApplication(applicationId, actorUserId)
      : await getSeekerApplication(applicationId, actorUserId);

  if (!access) {
    return { ok: false, code: 'NOT_FOUND', message: 'Application not found' };
  }

  const current = await prisma.jobApplication.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      status: true,
      title: true,
      userId: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!current) {
    return { ok: false, code: 'NOT_FOUND', message: 'Application not found' };
  }

  if (current.status === toStatus) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'Application already has this status' };
  }

  const fromStatus = current.status;
  const trimmedNote = note?.trim() ? note.trim().slice(0, 500) : null;

  const updated = await prisma.$transaction(async (tx) => {
    const app = await tx.jobApplication.update({
      where: { id: applicationId },
      data: { status: toStatus },
      select: { id: true, status: true, updatedAt: true },
    });

    const event = await tx.jobApplicationStatusEvent.create({
      data: {
        jobApplicationId: applicationId,
        from: fromStatus,
        to: toStatus,
        note: trimmedNote,
      },
      select: { from: true, to: true, at: true, note: true },
    });

    return { app, event };
  });

  if (actorRole === UserRole.EMPLOYER) {
    const actor = await prisma.user.findUnique({
      where: { id: actorUserId },
      select: { name: true, email: true },
    });
    const actorName = actor?.name?.trim() || actor?.email || 'Employer';

    await notifyApplicationStatusChange({
      jobApplicationId: applicationId,
      seekerUserId: current.userId,
      actorUserId,
      actorName,
      from: fromStatus,
      to: toStatus,
      applicationTitle: current.title,
    });
  }

  return {
    ok: true,
    application: {
      id: updated.app.id,
      status: updated.app.status,
      updatedAt: updated.app.updatedAt.toISOString(),
    },
    event: {
      from: updated.event.from,
      to: updated.event.to,
      at: updated.event.at.toISOString(),
      note: updated.event.note,
    },
  };
}
