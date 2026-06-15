import { Router } from 'express';
import { prisma, UserRole } from '@huntflow/db';
import { z } from 'zod';

import { getSeekerApplication } from '../lib/applicationAccess';
import {
  createApplicationInterview,
  createApplicationReminder,
  deleteApplicationInterview,
  deleteApplicationReminder,
  listApplicationInterviews,
  listApplicationReminders,
  updateApplicationInterview,
  updateApplicationReminder,
} from '../lib/applicationSchedule';
import { SEEKER_MANUAL_ALLOWED_STATUSES, updateApplicationStatus } from '../lib/applicationStatus';
import { listApplicationMessages, postApplicationMessage } from '../lib/applicationMessages';
import {
  employerApplicationDetailSelect,
  mapEmployerApplicationDetail,
} from '../lib/employerApplicationDetail';
import { sendError } from '../lib/errors';
import {
  createManualApplication,
  displayCompanyName,
  updateManualApplication,
} from '../lib/manualApplication';
import { requireJobSeeker } from '../middleware/requireJobSeeker';

const applicationIdSchema = z.string().uuid();
const interviewIdSchema = z.string().uuid();
const reminderIdSchema = z.string().uuid();

const createInterviewBodySchema = z.object({
  title: z.string().min(1).max(200),
  scheduledAt: z.coerce.date(),
  durationMinutes: z.coerce.number().int().min(1).max(480).optional(),
  location: z.string().max(200).optional(),
  notes: z.string().max(4000).optional(),
});

const updateInterviewBodySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  scheduledAt: z.coerce.date().optional(),
  durationMinutes: z.coerce.number().int().min(1).max(480).nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  notes: z.string().max(4000).nullable().optional(),
});

const createReminderBodySchema = z.object({
  title: z.string().min(1).max(200),
  remindAt: z.coerce.date(),
  notes: z.string().max(4000).optional(),
});

const updateReminderBodySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  remindAt: z.coerce.date().optional(),
  status: z.enum(['PENDING', 'DONE', 'CANCELLED']).optional(),
  notes: z.string().max(4000).nullable().optional(),
});

const messageBodySchema = z.object({
  body: z.string().min(1).max(4000),
});

const applicationSelect = {
  id: true,
  title: true,
  status: true,
  appliedAt: true,
  coverLetter: true,
  location: true,
  salaryText: true,
  notes: true,
  jobListingId: true,
  createdAt: true,
  updatedAt: true,
  company: { select: { id: true, name: true } },
  jobListing: { select: { id: true, title: true } },
} as const;

const createManualBodySchema = z.object({
  title: z.string().min(1).max(200),
  companyName: z.string().min(1).max(200),
  appliedAt: z.coerce.date().optional(),
  location: z.string().max(200).optional(),
  salaryText: z.string().max(100).optional(),
  notes: z.string().max(4000).optional(),
  sourceUrl: z.string().url().optional(),
});

const updateManualBodySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  companyName: z.string().min(1).max(200).optional(),
  appliedAt: z.coerce.date().nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  salaryText: z.string().max(100).nullable().optional(),
  notes: z.string().max(4000).nullable().optional(),
  sourceUrl: z.string().url().nullable().optional(),
});

function mapSeekerListItem(row: {
  id: string;
  title: string;
  status: string;
  appliedAt: Date | null;
  coverLetter: string | null;
  location: string | null;
  salaryText: string | null;
  notes: string | null;
  jobListingId: string | null;
  createdAt: Date;
  updatedAt: Date;
  company: { id: string; name: string };
  jobListing: { id: string; title: string } | null;
}) {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    appliedAt: row.appliedAt,
    coverLetter: row.coverLetter,
    location: row.location,
    salaryText: row.salaryText,
    notes: row.notes,
    isManual: row.jobListingId == null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    company: {
      id: row.company.id,
      name: displayCompanyName(row.company.name),
    },
    jobListing: row.jobListing,
  };
}

export const seekerApplicationsRouter = Router();

seekerApplicationsRouter.use('/seeker', requireJobSeeker);

seekerApplicationsRouter.get('/seeker/applications', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  try {
    const items = await prisma.jobApplication.findMany({
      where: { userId },
      orderBy: [{ appliedAt: 'desc' }, { updatedAt: 'desc' }],
      select: applicationSelect,
    });

    const statusCounts = items.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1;
      return acc;
    }, {});

    res.json({
      items: items.map(mapSeekerListItem),
      statusCounts,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not load applications');
  }
});

seekerApplicationsRouter.post('/seeker/applications', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const parsed = createManualBodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid request body', parsed.error.flatten());
    return;
  }

  try {
    const result = await createManualApplication(userId, parsed.data);
    if (!result.ok) {
      const status = result.code === 'CONFLICT' ? 409 : 400;
      sendError(res, status, result.code, result.message);
      return;
    }

    res.status(201).json(result);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not create application');
  }
});

seekerApplicationsRouter.patch('/seeker/applications/:id', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const idParsed = applicationIdSchema.safeParse(req.params.id);
  if (!idParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid application id');
    return;
  }

  const parsed = updateManualBodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid request body', parsed.error.flatten());
    return;
  }

  try {
    const result = await updateManualApplication(userId, idParsed.data, parsed.data);
    if (!result.ok) {
      const status =
        result.code === 'NOT_FOUND' ? 404 : result.code === 'FORBIDDEN' ? 403 : result.code === 'CONFLICT' ? 409 : 400;
      sendError(res, status, result.code, result.message);
      return;
    }

    res.json(result);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not update application');
  }
});

seekerApplicationsRouter.get('/seeker/applications/:id', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const idParsed = applicationIdSchema.safeParse(req.params.id);
  if (!idParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid application id');
    return;
  }

  try {
    const access = await getSeekerApplication(idParsed.data, userId);
    if (!access) {
      sendError(res, 404, 'NOT_FOUND', 'Application not found');
      return;
    }

    const row = await prisma.jobApplication.findUnique({
      where: { id: idParsed.data },
      select: employerApplicationDetailSelect,
    });

    if (!row) {
      sendError(res, 404, 'NOT_FOUND', 'Application not found');
      return;
    }

    res.json(mapEmployerApplicationDetail(row));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not load application');
  }
});

seekerApplicationsRouter.get('/seeker/applications/:id/messages', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const idParsed = applicationIdSchema.safeParse(req.params.id);
  if (!idParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid application id');
    return;
  }

  const cursorParsed = z.string().uuid().safeParse(req.query.cursor);
  if (req.query.cursor !== undefined && !cursorParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid cursor');
    return;
  }

  const limitParsed = z.coerce.number().int().min(1).max(100).safeParse(req.query.limit);
  const limit = limitParsed.success ? limitParsed.data : 30;

  try {
    const access = await getSeekerApplication(idParsed.data, userId);
    if (!access) {
      sendError(res, 404, 'NOT_FOUND', 'Application not found');
      return;
    }

    const result = await listApplicationMessages(idParsed.data, {
      cursor: cursorParsed.success ? cursorParsed.data : undefined,
      limit,
    });
    res.json(result);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not load messages');
  }
});

seekerApplicationsRouter.post('/seeker/applications/:id/messages', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const idParsed = applicationIdSchema.safeParse(req.params.id);
  if (!idParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid application id');
    return;
  }

  const parsed = messageBodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid message', parsed.error.flatten());
    return;
  }

  try {
    const access = await getSeekerApplication(idParsed.data, userId);
    if (!access) {
      sendError(res, 404, 'NOT_FOUND', 'Application not found');
      return;
    }

    const result = await postApplicationMessage(idParsed.data, userId, parsed.data.body);
    if ('error' in result) {
      sendError(res, 400, result.error ?? 'VALIDATION_ERROR', result.message ?? 'Invalid message');
      return;
    }

    res.status(201).json(result);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not send message');
  }
});

const seekerStatusBodySchema = z.object({
  status: z.enum(SEEKER_MANUAL_ALLOWED_STATUSES),
});

seekerApplicationsRouter.patch('/seeker/applications/:id/status', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const idParsed = applicationIdSchema.safeParse(req.params.id);
  if (!idParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid application id');
    return;
  }

  const parsed = seekerStatusBodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid request body', parsed.error.flatten());
    return;
  }

  try {
    const result = await updateApplicationStatus({
      applicationId: idParsed.data,
      actorUserId: userId,
      actorRole: UserRole.JOB_SEEKER,
      toStatus: parsed.data.status,
    });

    if (!result.ok) {
      const status = result.code === 'NOT_FOUND' ? 404 : result.code === 'FORBIDDEN' ? 403 : 400;
      sendError(res, status, result.code, result.message);
      return;
    }

    res.json(result);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not update application status');
  }
});

seekerApplicationsRouter.get('/seeker/applications/:id/interviews', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const idParsed = applicationIdSchema.safeParse(req.params.id);
  if (!idParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid application id');
    return;
  }

  try {
    const result = await listApplicationInterviews(idParsed.data, userId);
    if (!result.ok) {
      sendError(res, 404, result.code, 'Application not found');
      return;
    }
    res.json({ items: result.items });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not load interviews');
  }
});

seekerApplicationsRouter.post('/seeker/applications/:id/interviews', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const idParsed = applicationIdSchema.safeParse(req.params.id);
  if (!idParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid application id');
    return;
  }

  const parsed = createInterviewBodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid request body', parsed.error.flatten());
    return;
  }

  try {
    const result = await createApplicationInterview(idParsed.data, userId, parsed.data);
    if (!result.ok) {
      const status = result.code === 'NOT_FOUND' ? 404 : 400;
      sendError(res, status, result.code, result.message ?? 'Could not create interview');
      return;
    }
    res.status(201).json({ interview: result.interview });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not create interview');
  }
});

seekerApplicationsRouter.patch('/seeker/applications/:id/interviews/:interviewId', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const idParsed = applicationIdSchema.safeParse(req.params.id);
  const interviewParsed = interviewIdSchema.safeParse(req.params.interviewId);
  if (!idParsed.success || !interviewParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid id');
    return;
  }

  const parsed = updateInterviewBodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid request body', parsed.error.flatten());
    return;
  }

  try {
    const result = await updateApplicationInterview(
      idParsed.data,
      interviewParsed.data,
      userId,
      parsed.data,
    );
    if (!result.ok) {
      const status = result.code === 'NOT_FOUND' ? 404 : 400;
      sendError(res, status, result.code, result.message ?? 'Could not update interview');
      return;
    }
    res.json({ interview: result.interview });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not update interview');
  }
});

seekerApplicationsRouter.delete('/seeker/applications/:id/interviews/:interviewId', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const idParsed = applicationIdSchema.safeParse(req.params.id);
  const interviewParsed = interviewIdSchema.safeParse(req.params.interviewId);
  if (!idParsed.success || !interviewParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid id');
    return;
  }

  try {
    const result = await deleteApplicationInterview(idParsed.data, interviewParsed.data, userId);
    if (!result.ok) {
      sendError(res, 404, result.code, 'Interview not found');
      return;
    }
    res.status(204).send();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not delete interview');
  }
});

seekerApplicationsRouter.get('/seeker/applications/:id/reminders', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const idParsed = applicationIdSchema.safeParse(req.params.id);
  if (!idParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid application id');
    return;
  }

  try {
    const result = await listApplicationReminders(idParsed.data, userId);
    if (!result.ok) {
      sendError(res, 404, result.code, 'Application not found');
      return;
    }
    res.json({ items: result.items });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not load reminders');
  }
});

seekerApplicationsRouter.post('/seeker/applications/:id/reminders', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const idParsed = applicationIdSchema.safeParse(req.params.id);
  if (!idParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid application id');
    return;
  }

  const parsed = createReminderBodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid request body', parsed.error.flatten());
    return;
  }

  try {
    const result = await createApplicationReminder(idParsed.data, userId, parsed.data);
    if (!result.ok) {
      const status = result.code === 'NOT_FOUND' ? 404 : 400;
      sendError(res, status, result.code, result.message ?? 'Could not create reminder');
      return;
    }
    res.status(201).json({ reminder: result.reminder });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not create reminder');
  }
});

seekerApplicationsRouter.patch('/seeker/applications/:id/reminders/:reminderId', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const idParsed = applicationIdSchema.safeParse(req.params.id);
  const reminderParsed = reminderIdSchema.safeParse(req.params.reminderId);
  if (!idParsed.success || !reminderParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid id');
    return;
  }

  const parsed = updateReminderBodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid request body', parsed.error.flatten());
    return;
  }

  try {
    const result = await updateApplicationReminder(
      idParsed.data,
      reminderParsed.data,
      userId,
      parsed.data,
    );
    if (!result.ok) {
      const status = result.code === 'NOT_FOUND' ? 404 : 400;
      sendError(res, status, result.code, result.message ?? 'Could not update reminder');
      return;
    }
    res.json({ reminder: result.reminder });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not update reminder');
  }
});

seekerApplicationsRouter.delete('/seeker/applications/:id/reminders/:reminderId', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const idParsed = applicationIdSchema.safeParse(req.params.id);
  const reminderParsed = reminderIdSchema.safeParse(req.params.reminderId);
  if (!idParsed.success || !reminderParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid id');
    return;
  }

  try {
    const result = await deleteApplicationReminder(idParsed.data, reminderParsed.data, userId);
    if (!result.ok) {
      sendError(res, 404, result.code, 'Reminder not found');
      return;
    }
    res.status(204).send();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not delete reminder');
  }
});
