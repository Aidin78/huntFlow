import { prisma, type ReminderStatus } from '@huntflow/db';

import { getSeekerApplication } from './applicationAccess';
import { sanitizePlainText } from './sanitize';

export type ScheduleErrorCode = 'NOT_FOUND' | 'VALIDATION_ERROR';

export type InterviewDto = {
  id: string;
  applicationId: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number | null;
  location: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ReminderDto = {
  id: string;
  applicationId: string;
  title: string;
  remindAt: string;
  status: ReminderStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

const interviewSelect = {
  id: true,
  jobApplicationId: true,
  title: true,
  scheduledAt: true,
  durationMinutes: true,
  location: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} as const;

const reminderSelect = {
  id: true,
  jobApplicationId: true,
  title: true,
  remindAt: true,
  status: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} as const;

function mapInterview(row: {
  id: string;
  jobApplicationId: string;
  title: string;
  scheduledAt: Date;
  durationMinutes: number | null;
  location: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}): InterviewDto {
  return {
    id: row.id,
    applicationId: row.jobApplicationId,
    title: row.title,
    scheduledAt: row.scheduledAt.toISOString(),
    durationMinutes: row.durationMinutes,
    location: row.location,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapReminder(row: {
  id: string;
  jobApplicationId: string;
  title: string;
  remindAt: Date;
  status: ReminderStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ReminderDto {
  return {
    id: row.id,
    applicationId: row.jobApplicationId,
    title: row.title,
    remindAt: row.remindAt.toISOString(),
    status: row.status,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function assertSeekerOwnsApplication(
  applicationId: string,
  userId: string,
): Promise<{ ok: true } | { ok: false; code: ScheduleErrorCode }> {
  const access = await getSeekerApplication(applicationId, userId);
  if (!access) {
    return { ok: false, code: 'NOT_FOUND' };
  }
  return { ok: true };
}

async function getInterviewForApplication(applicationId: string, interviewId: string) {
  return prisma.interview.findFirst({
    where: { id: interviewId, jobApplicationId: applicationId },
    select: interviewSelect,
  });
}

async function getReminderForApplication(applicationId: string, reminderId: string) {
  return prisma.reminder.findFirst({
    where: { id: reminderId, jobApplicationId: applicationId },
    select: reminderSelect,
  });
}

export async function listApplicationInterviews(
  applicationId: string,
  userId: string,
): Promise<{ ok: true; items: InterviewDto[] } | { ok: false; code: ScheduleErrorCode }> {
  const access = await assertSeekerOwnsApplication(applicationId, userId);
  if (!access.ok) return access;

  const rows = await prisma.interview.findMany({
    where: { jobApplicationId: applicationId },
    orderBy: [{ scheduledAt: 'asc' }, { id: 'asc' }],
    select: interviewSelect,
  });

  return { ok: true, items: rows.map(mapInterview) };
}

export type CreateInterviewInput = {
  title: string;
  scheduledAt: Date;
  durationMinutes?: number;
  location?: string;
  notes?: string;
};

export async function createApplicationInterview(
  applicationId: string,
  userId: string,
  input: CreateInterviewInput,
): Promise<{ ok: true; interview: InterviewDto } | { ok: false; code: ScheduleErrorCode; message?: string }> {
  const access = await assertSeekerOwnsApplication(applicationId, userId);
  if (!access.ok) return access;

  const title = input.title.trim();
  if (!title) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'Title is required' };
  }

  const row = await prisma.interview.create({
    data: {
      jobApplicationId: applicationId,
      title: sanitizePlainText(title, 200),
      scheduledAt: input.scheduledAt,
      durationMinutes: input.durationMinutes ?? null,
      location: input.location?.trim() ? sanitizePlainText(input.location, 200) : null,
      notes: input.notes?.trim() ? sanitizePlainText(input.notes, 4000) : null,
    },
    select: interviewSelect,
  });

  return { ok: true, interview: mapInterview(row) };
}

export type UpdateInterviewInput = {
  title?: string;
  scheduledAt?: Date;
  durationMinutes?: number | null;
  location?: string | null;
  notes?: string | null;
};

export async function updateApplicationInterview(
  applicationId: string,
  interviewId: string,
  userId: string,
  input: UpdateInterviewInput,
): Promise<{ ok: true; interview: InterviewDto } | { ok: false; code: ScheduleErrorCode; message?: string }> {
  const access = await assertSeekerOwnsApplication(applicationId, userId);
  if (!access.ok) return access;

  const existing = await getInterviewForApplication(applicationId, interviewId);
  if (!existing) {
    return { ok: false, code: 'NOT_FOUND' };
  }

  if (input.title !== undefined && !input.title.trim()) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'Title is required' };
  }

  const row = await prisma.interview.update({
    where: { id: interviewId },
    data: {
      ...(input.title !== undefined ? { title: sanitizePlainText(input.title.trim(), 200) } : {}),
      ...(input.scheduledAt !== undefined ? { scheduledAt: input.scheduledAt } : {}),
      ...(input.durationMinutes !== undefined ? { durationMinutes: input.durationMinutes } : {}),
      ...(input.location !== undefined
        ? { location: input.location?.trim() ? sanitizePlainText(input.location, 200) : null }
        : {}),
      ...(input.notes !== undefined
        ? { notes: input.notes?.trim() ? sanitizePlainText(input.notes, 4000) : null }
        : {}),
    },
    select: interviewSelect,
  });

  return { ok: true, interview: mapInterview(row) };
}

export async function deleteApplicationInterview(
  applicationId: string,
  interviewId: string,
  userId: string,
): Promise<{ ok: true } | { ok: false; code: ScheduleErrorCode }> {
  const access = await assertSeekerOwnsApplication(applicationId, userId);
  if (!access.ok) return access;

  const existing = await getInterviewForApplication(applicationId, interviewId);
  if (!existing) {
    return { ok: false, code: 'NOT_FOUND' };
  }

  await prisma.interview.delete({ where: { id: interviewId } });
  return { ok: true };
}

export async function listApplicationReminders(
  applicationId: string,
  userId: string,
): Promise<{ ok: true; items: ReminderDto[] } | { ok: false; code: ScheduleErrorCode }> {
  const access = await assertSeekerOwnsApplication(applicationId, userId);
  if (!access.ok) return access;

  const rows = await prisma.reminder.findMany({
    where: { jobApplicationId: applicationId },
    orderBy: [{ remindAt: 'asc' }, { id: 'asc' }],
    select: reminderSelect,
  });

  return { ok: true, items: rows.map(mapReminder) };
}

export type CreateReminderInput = {
  title: string;
  remindAt: Date;
  notes?: string;
};

export async function createApplicationReminder(
  applicationId: string,
  userId: string,
  input: CreateReminderInput,
): Promise<{ ok: true; reminder: ReminderDto } | { ok: false; code: ScheduleErrorCode; message?: string }> {
  const access = await assertSeekerOwnsApplication(applicationId, userId);
  if (!access.ok) return access;

  const title = input.title.trim();
  if (!title) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'Title is required' };
  }

  const row = await prisma.reminder.create({
    data: {
      jobApplicationId: applicationId,
      title: sanitizePlainText(title, 200),
      remindAt: input.remindAt,
      notes: input.notes?.trim() ? sanitizePlainText(input.notes, 4000) : null,
    },
    select: reminderSelect,
  });

  return { ok: true, reminder: mapReminder(row) };
}

export type UpdateReminderInput = {
  title?: string;
  remindAt?: Date;
  status?: ReminderStatus;
  notes?: string | null;
};

export async function updateApplicationReminder(
  applicationId: string,
  reminderId: string,
  userId: string,
  input: UpdateReminderInput,
): Promise<{ ok: true; reminder: ReminderDto } | { ok: false; code: ScheduleErrorCode; message?: string }> {
  const access = await assertSeekerOwnsApplication(applicationId, userId);
  if (!access.ok) return access;

  const existing = await getReminderForApplication(applicationId, reminderId);
  if (!existing) {
    return { ok: false, code: 'NOT_FOUND' };
  }

  if (input.title !== undefined && !input.title.trim()) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'Title is required' };
  }

  const row = await prisma.reminder.update({
    where: { id: reminderId },
    data: {
      ...(input.title !== undefined ? { title: sanitizePlainText(input.title.trim(), 200) } : {}),
      ...(input.remindAt !== undefined ? { remindAt: input.remindAt } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.notes !== undefined
        ? { notes: input.notes?.trim() ? sanitizePlainText(input.notes, 4000) : null }
        : {}),
    },
    select: reminderSelect,
  });

  return { ok: true, reminder: mapReminder(row) };
}

export async function deleteApplicationReminder(
  applicationId: string,
  reminderId: string,
  userId: string,
): Promise<{ ok: true } | { ok: false; code: ScheduleErrorCode }> {
  const access = await assertSeekerOwnsApplication(applicationId, userId);
  if (!access.ok) return access;

  const existing = await getReminderForApplication(applicationId, reminderId);
  if (!existing) {
    return { ok: false, code: 'NOT_FOUND' };
  }

  await prisma.reminder.delete({ where: { id: reminderId } });
  return { ok: true };
}
