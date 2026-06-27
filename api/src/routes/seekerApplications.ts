import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

import { Router } from 'express';
import multer from 'multer';
import { prisma, UserRole } from '@huntflow/db';
import { z } from 'zod';

import { getSeekerApplication } from '../lib/applicationAccess';
import {
  createApplicationAttachment,
  deleteApplicationAttachment,
  listApplicationAttachments,
} from '../lib/applicationAttachments';
import {
  createApplicationLink,
  deleteApplicationLink,
  listApplicationLinks,
  updateApplicationLink,
} from '../lib/applicationLinks';
import {
  createApplicationContact,
  deleteApplicationContact,
  listApplicationContacts,
  updateApplicationContact,
} from '../lib/applicationContacts';
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
import {
  attachApplicationTag,
  attachApplicationTagByName,
  detachApplicationTag,
  listApplicationTags,
  replaceApplicationTags,
} from '../lib/applicationTags';
import {
  createManualApplication,
  displayCompanyName,
  updateManualApplication,
} from '../lib/manualApplication';
import {
  updateApplicationResume,
  uploadApplicationResume,
} from '../lib/applicationResume';
import { sendError } from '../lib/errors';
import { userFileDto } from '../lib/userFileDto';
import { TAG_COLOR_PRESETS } from '../lib/tags';
import { deleteFileIfExists, ensureUploadDir, getUploadDir, validateAttachmentFile, validateResumeFile } from '../lib/uploads';
import { requireJobSeeker } from '../middleware/requireJobSeeker';

ensureUploadDir();
const attachmentUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensureUploadDir();
      cb(null, getUploadDir());
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || '';
      cb(null, `${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

const resumeUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensureUploadDir();
      cb(null, getUploadDir());
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || '';
      cb(null, `${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

const applicationIdSchema = z.string().uuid();
const interviewIdSchema = z.string().uuid();
const reminderIdSchema = z.string().uuid();
const contactIdSchema = z.string().uuid();
const linkIdSchema = z.string().uuid();
const attachmentIdSchema = z.string().uuid();
const tagIdSchema = z.string().uuid();

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

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .transform((s) => (s && s.length > 0 ? s : undefined))
  .refine((s) => s === undefined || z.string().email().safeParse(s).success, 'Invalid email');

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((s) => (s && s.length > 0 ? s : undefined))
  .refine((s) => s === undefined || z.string().url().safeParse(s).success, 'Invalid URL');

const createContactBodySchema = z.object({
  name: z.string().min(1).max(200),
  title: z.string().max(200).optional(),
  email: optionalEmail,
  phone: z.string().max(40).optional(),
  linkedin: optionalUrl,
  notes: z.string().max(4000).optional(),
  role: z.string().max(100).optional(),
});

const updateContactBodySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  title: z.string().max(200).nullable().optional(),
  email: z.union([optionalEmail, z.null()]).optional(),
  phone: z.string().max(40).nullable().optional(),
  linkedin: z.union([optionalUrl, z.null()]).optional(),
  notes: z.string().max(4000).nullable().optional(),
  role: z.string().max(100).nullable().optional(),
});

const createLinkBodySchema = z.object({
  label: z.string().max(100).optional(),
  url: z.string().url(),
});

const updateLinkBodySchema = z.object({
  label: z.string().max(100).nullable().optional(),
  url: z.string().url().optional(),
});

const updateResumeBodySchema = z.object({
  resumeFileId: z.string().uuid().nullable(),
});

const tagColorSchema = z.enum(TAG_COLOR_PRESETS as unknown as [string, ...string[]]);

const attachTagByIdBodySchema = z.object({
  tagId: z.string().uuid(),
});

const attachTagByNameBodySchema = z.object({
  name: z.string().min(1).max(40),
  color: tagColorSchema.optional(),
});

const replaceTagsBodySchema = z.object({
  tagIds: z.array(z.string().uuid()),
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
  tags: { select: { tag: { select: { id: true, name: true, color: true } } } },
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
  tags: Array<{ tag: { id: string; name: string; color: string | null } }>;
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
    tags: row.tags.map((entry) => entry.tag),
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

seekerApplicationsRouter.get('/seeker/applications/:id/contacts', async (req, res) => {
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
    const result = await listApplicationContacts(idParsed.data, userId);
    if (!result.ok) {
      sendError(res, 404, result.code, 'Application not found');
      return;
    }
    res.json({ items: result.items });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not load contacts');
  }
});

seekerApplicationsRouter.post('/seeker/applications/:id/contacts', async (req, res) => {
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

  const parsed = createContactBodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid request body', parsed.error.flatten());
    return;
  }

  try {
    const result = await createApplicationContact(idParsed.data, userId, parsed.data);
    if (!result.ok) {
      const status = result.code === 'NOT_FOUND' ? 404 : 400;
      sendError(res, status, result.code, result.message ?? 'Could not create contact');
      return;
    }
    res.status(201).json({ contact: result.contact });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not create contact');
  }
});

seekerApplicationsRouter.patch('/seeker/applications/:id/contacts/:contactId', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const idParsed = applicationIdSchema.safeParse(req.params.id);
  const contactParsed = contactIdSchema.safeParse(req.params.contactId);
  if (!idParsed.success || !contactParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid id');
    return;
  }

  const parsed = updateContactBodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid request body', parsed.error.flatten());
    return;
  }

  try {
    const result = await updateApplicationContact(
      idParsed.data,
      contactParsed.data,
      userId,
      parsed.data,
    );
    if (!result.ok) {
      const status = result.code === 'NOT_FOUND' ? 404 : 400;
      sendError(res, status, result.code, result.message ?? 'Could not update contact');
      return;
    }
    res.json({ contact: result.contact });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not update contact');
  }
});

seekerApplicationsRouter.delete('/seeker/applications/:id/contacts/:contactId', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const idParsed = applicationIdSchema.safeParse(req.params.id);
  const contactParsed = contactIdSchema.safeParse(req.params.contactId);
  if (!idParsed.success || !contactParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid id');
    return;
  }

  try {
    const result = await deleteApplicationContact(idParsed.data, contactParsed.data, userId);
    if (!result.ok) {
      sendError(res, 404, result.code, 'Contact not found');
      return;
    }
    res.status(204).send();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not delete contact');
  }
});

seekerApplicationsRouter.get('/seeker/applications/:id/links', async (req, res) => {
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
    const result = await listApplicationLinks(idParsed.data, userId);
    if (!result.ok) {
      sendError(res, 404, result.code, 'Application not found');
      return;
    }
    res.json({ items: result.items });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not load links');
  }
});

seekerApplicationsRouter.post('/seeker/applications/:id/links', async (req, res) => {
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

  const parsed = createLinkBodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid request body', parsed.error.flatten());
    return;
  }

  try {
    const result = await createApplicationLink(idParsed.data, userId, parsed.data);
    if (!result.ok) {
      const status = result.code === 'NOT_FOUND' ? 404 : 400;
      sendError(res, status, result.code, result.message ?? 'Could not create link');
      return;
    }
    res.status(201).json({ link: result.link });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not create link');
  }
});

seekerApplicationsRouter.patch('/seeker/applications/:id/links/:linkId', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const idParsed = applicationIdSchema.safeParse(req.params.id);
  const linkParsed = linkIdSchema.safeParse(req.params.linkId);
  if (!idParsed.success || !linkParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid id');
    return;
  }

  const parsed = updateLinkBodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid request body', parsed.error.flatten());
    return;
  }

  try {
    const result = await updateApplicationLink(
      idParsed.data,
      linkParsed.data,
      userId,
      parsed.data,
    );
    if (!result.ok) {
      const status = result.code === 'NOT_FOUND' ? 404 : 400;
      sendError(res, status, result.code, result.message ?? 'Could not update link');
      return;
    }
    res.json({ link: result.link });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not update link');
  }
});

seekerApplicationsRouter.delete('/seeker/applications/:id/links/:linkId', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const idParsed = applicationIdSchema.safeParse(req.params.id);
  const linkParsed = linkIdSchema.safeParse(req.params.linkId);
  if (!idParsed.success || !linkParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid id');
    return;
  }

  try {
    const result = await deleteApplicationLink(idParsed.data, linkParsed.data, userId);
    if (!result.ok) {
      sendError(res, 404, result.code, 'Link not found');
      return;
    }
    res.status(204).send();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not delete link');
  }
});

seekerApplicationsRouter.patch('/seeker/applications/:id/resume', (req, res) => {
  const isMultipart = req.is('multipart/form-data');

  if (isMultipart) {
    resumeUpload.single('resume')(req, res, async (err: unknown) => {
      const userId = req.userId;
      if (!userId) {
        sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
        return;
      }

      const idParsed = applicationIdSchema.safeParse(req.params.id);
      if (!idParsed.success) {
        if (req.file?.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        sendError(res, 400, 'VALIDATION_ERROR', 'Invalid application id');
        return;
      }

      if (err) {
        sendError(res, 400, 'VALIDATION_ERROR', 'Invalid upload');
        return;
      }

      const file = req.file;
      if (!file) {
        sendError(res, 400, 'VALIDATION_ERROR', 'Resume file is required');
        return;
      }

      const validationError = validateResumeFile(file.mimetype, file.size);
      if (validationError) {
        fs.unlinkSync(file.path);
        sendError(res, 400, 'VALIDATION_ERROR', validationError);
        return;
      }

      try {
        const result = await uploadApplicationResume(idParsed.data, userId, {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          filename: file.filename,
        });
        if (!result.ok) {
          deleteFileIfExists(file.filename);
          const status = result.code === 'NOT_FOUND' ? 404 : 400;
          sendError(res, status, result.code, result.message);
          return;
        }

        const resume = await prisma.userFile.findUnique({
          where: { id: result.resumeFileId },
          select: { id: true, filename: true, mimeType: true, sizeBytes: true, createdAt: true },
        });
        res.json({
          resumeFileId: result.resumeFileId,
          resume: resume ? userFileDto(resume) : null,
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        if (req.file?.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        sendError(res, 500, 'INTERNAL_ERROR', 'Could not update resume');
      }
    });
    return;
  }

  void (async () => {
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

    const parsed = updateResumeBodySchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, 400, 'VALIDATION_ERROR', 'Invalid request body', parsed.error.flatten());
      return;
    }

    try {
      const result = await updateApplicationResume(
        idParsed.data,
        userId,
        parsed.data.resumeFileId,
      );
      if (!result.ok) {
        const status = result.code === 'NOT_FOUND' ? 404 : 400;
        sendError(res, status, result.code, result.message);
        return;
      }

      let resume = null;
      if (result.resumeFileId) {
        const file = await prisma.userFile.findUnique({
          where: { id: result.resumeFileId },
          select: { id: true, filename: true, mimeType: true, sizeBytes: true, createdAt: true },
        });
        resume = file ? userFileDto(file) : null;
      }

      res.json({ resumeFileId: result.resumeFileId, resume });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      sendError(res, 500, 'INTERNAL_ERROR', 'Could not update resume');
    }
  })();
});

seekerApplicationsRouter.get('/seeker/applications/:id/attachments', async (req, res) => {
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
    const result = await listApplicationAttachments(idParsed.data, userId);
    if (!result.ok) {
      sendError(res, 404, result.code, 'Application not found');
      return;
    }
    res.json({ items: result.items });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not load attachments');
  }
});

seekerApplicationsRouter.post('/seeker/applications/:id/attachments', (req, res) => {
  attachmentUpload.single('file')(req, res, async (err: unknown) => {
    const userId = req.userId;
    if (!userId) {
      sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
      return;
    }

    const idParsed = applicationIdSchema.safeParse(req.params.id);
    if (!idParsed.success) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      sendError(res, 400, 'VALIDATION_ERROR', 'Invalid application id');
      return;
    }

    if (err) {
      sendError(res, 400, 'VALIDATION_ERROR', 'Invalid upload');
      return;
    }

    const file = req.file;
    if (!file) {
      sendError(res, 400, 'VALIDATION_ERROR', 'File is required');
      return;
    }

    const validationError = validateAttachmentFile(file.mimetype, file.size);
    if (validationError) {
      fs.unlinkSync(file.path);
      sendError(res, 400, 'VALIDATION_ERROR', validationError);
      return;
    }

    const notesParsed = z.string().max(4000).optional().safeParse(req.body.notes);

    try {
      const result = await createApplicationAttachment(idParsed.data, userId, {
        filename: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        storageKey: file.filename,
        notes: notesParsed.success ? notesParsed.data : undefined,
      });

      if (!result.ok) {
        deleteFileIfExists(file.filename);
        const status = result.code === 'NOT_FOUND' ? 404 : 400;
        sendError(res, status, result.code, result.message ?? 'Could not save attachment');
        return;
      }

      res.status(201).json({ attachment: result.attachment });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      sendError(res, 500, 'INTERNAL_ERROR', 'Could not save attachment');
    }
  });
});

seekerApplicationsRouter.delete(
  '/seeker/applications/:id/attachments/:attachmentId',
  async (req, res) => {
    const userId = req.userId;
    if (!userId) {
      sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
      return;
    }

    const idParsed = applicationIdSchema.safeParse(req.params.id);
    const attachmentParsed = attachmentIdSchema.safeParse(req.params.attachmentId);
    if (!idParsed.success || !attachmentParsed.success) {
      sendError(res, 400, 'VALIDATION_ERROR', 'Invalid id');
      return;
    }

    try {
      const result = await deleteApplicationAttachment(
        idParsed.data,
        attachmentParsed.data,
        userId,
      );
      if (!result.ok) {
        sendError(res, 404, result.code, 'Attachment not found');
        return;
      }
      res.status(204).send();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      sendError(res, 500, 'INTERNAL_ERROR', 'Could not delete attachment');
    }
  },
);

seekerApplicationsRouter.get('/seeker/applications/:id/tags', async (req, res) => {
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
    const result = await listApplicationTags(idParsed.data, userId);
    if (!result.ok) {
      sendError(res, 404, result.code, 'Application not found');
      return;
    }
    res.json({ items: result.items });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not load tags');
  }
});

seekerApplicationsRouter.post('/seeker/applications/:id/tags', async (req, res) => {
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

  const byId = attachTagByIdBodySchema.safeParse(req.body);
  const byName = byId.success ? null : attachTagByNameBodySchema.safeParse(req.body);
  if (!byId.success && !byName?.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid request body');
    return;
  }

  try {
    const result = byId.success
      ? await attachApplicationTag(idParsed.data, userId, byId.data.tagId)
      : await attachApplicationTagByName(
          idParsed.data,
          userId,
          byName!.data.name,
          byName!.data.color,
        );

    if (!result.ok) {
      const status =
        result.code === 'NOT_FOUND' ? 404 : result.code === 'FORBIDDEN' ? 403 : 400;
      sendError(res, status, result.code, result.message ?? 'Could not attach tag');
      return;
    }
    res.status(201).json({ tag: result.tag });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not attach tag');
  }
});

seekerApplicationsRouter.put('/seeker/applications/:id/tags', async (req, res) => {
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

  const parsed = replaceTagsBodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid request body', parsed.error.flatten());
    return;
  }

  try {
    const result = await replaceApplicationTags(idParsed.data, userId, parsed.data.tagIds);
    if (!result.ok) {
      const status =
        result.code === 'NOT_FOUND' ? 404 : result.code === 'FORBIDDEN' ? 403 : 400;
      sendError(res, status, result.code, result.message ?? 'Could not update tags');
      return;
    }
    res.json({ items: result.items });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not update tags');
  }
});

seekerApplicationsRouter.delete('/seeker/applications/:id/tags/:tagId', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const idParsed = applicationIdSchema.safeParse(req.params.id);
  const tagIdParsed = tagIdSchema.safeParse(req.params.tagId);
  if (!idParsed.success || !tagIdParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid id');
    return;
  }

  try {
    const result = await detachApplicationTag(idParsed.data, userId, tagIdParsed.data);
    if (!result.ok) {
      sendError(res, 404, result.code, 'Tag not found on application');
      return;
    }
    res.status(204).send();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not detach tag');
  }
});
