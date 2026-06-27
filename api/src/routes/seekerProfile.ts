import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

import { Router } from 'express';
import multer from 'multer';
import { prisma } from '@huntflow/db';
import { z } from 'zod';

import { sendError } from '../lib/errors';
import {
  isResumeReferencedByApplications,
  safeDeleteResumeFileIfUnreferenced,
} from '../lib/applicationResume';
import { deleteFileIfExists, ensureUploadDir, getUploadDir, validateResumeFile } from '../lib/uploads';
import { userFileDto } from '../lib/userFileDto';
import { requireJobSeeker } from '../middleware/requireJobSeeker';

const profileBodySchema = z.object({
  headline: z.string().trim().max(200).optional(),
  bio: z.string().trim().max(4000).optional(),
  phone: z.string().trim().max(40).optional(),
  location: z.string().trim().max(120).optional(),
  linkedinUrl: z.string().trim().max(500).optional(),
  portfolioUrl: z.string().trim().max(500).optional(),
  githubUrl: z.string().trim().max(500).optional(),
});

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((s) => (s && s.length > 0 ? s : undefined))
  .refine((s) => s === undefined || z.string().url().safeParse(s).success, 'Invalid URL');

const profileBodySchemaStrict = profileBodySchema.extend({
  linkedinUrl: optionalUrl,
  portfolioUrl: optionalUrl,
  githubUrl: optionalUrl,
});

const seekerProfileSelect = {
  userId: true,
  headline: true,
  bio: true,
  phone: true,
  location: true,
  linkedinUrl: true,
  portfolioUrl: true,
  githubUrl: true,
  currentResumeFileId: true,
  currentResumeFile: {
    select: { id: true, filename: true, mimeType: true, sizeBytes: true, createdAt: true },
  },
} as const;

function profileResponse(
  profile: {
    userId: string;
    headline: string | null;
    bio: string | null;
    phone: string | null;
    location: string | null;
    linkedinUrl: string | null;
    portfolioUrl: string | null;
    githubUrl: string | null;
    currentResumeFileId: string | null;
    currentResumeFile: {
      id: string;
      filename: string;
      mimeType: string;
      sizeBytes: number;
      createdAt: Date;
    } | null;
  } | null,
) {
  return {
    profile: profile
      ? {
          ...profile,
          resume: profile.currentResumeFile ? userFileDto(profile.currentResumeFile) : null,
          currentResumeFile: undefined,
        }
      : null,
  };
}

ensureUploadDir();
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensureUploadDir();
      cb(null, getUploadDir());
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || '.pdf';
      cb(null, `${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

export const seekerProfileRouter = Router();

seekerProfileRouter.use('/seeker', requireJobSeeker);

seekerProfileRouter.get('/seeker/profile', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const profile = await prisma.jobSeekerProfile.findUnique({
    where: { userId },
    select: seekerProfileSelect,
  });

  res.json(profileResponse(profile));
});

seekerProfileRouter.put('/seeker/profile', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const parsed = profileBodySchemaStrict.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid profile', parsed.error.flatten());
    return;
  }

  const data = {
    headline: parsed.data.headline ?? null,
    bio: parsed.data.bio ?? null,
    phone: parsed.data.phone ?? null,
    location: parsed.data.location ?? null,
    linkedinUrl: parsed.data.linkedinUrl ?? null,
    portfolioUrl: parsed.data.portfolioUrl ?? null,
    githubUrl: parsed.data.githubUrl ?? null,
  };

  const profile = await prisma.jobSeekerProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
    select: seekerProfileSelect,
  });

  res.json(profileResponse(profile));
});

seekerProfileRouter.post('/seeker/resume', (req, res) => {
  upload.single('resume')(req, res, async (err: unknown) => {
    const userId = req.userId;
    if (!userId) {
      sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
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
      const storageKey = file.filename;
      const previous = await prisma.jobSeekerProfile.findUnique({
        where: { userId },
        select: { currentResumeFileId: true, currentResumeFile: { select: { storageKey: true } } },
      });

      const userFile = await prisma.userFile.create({
        data: {
          userId,
          kind: 'RESUME',
          filename: file.originalname,
          mimeType: file.mimetype,
          sizeBytes: file.size,
          storageKey,
        },
        select: { id: true, filename: true, mimeType: true, sizeBytes: true, createdAt: true },
      });

      await prisma.jobSeekerProfile.upsert({
        where: { userId },
        create: { userId, currentResumeFileId: userFile.id },
        update: { currentResumeFileId: userFile.id },
      });

      if (previous?.currentResumeFile?.storageKey && previous.currentResumeFileId) {
        await safeDeleteResumeFileIfUnreferenced(
          previous.currentResumeFileId,
          previous.currentResumeFile.storageKey,
        );
      }

      res.status(201).json({ resume: userFileDto(userFile) });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      sendError(res, 500, 'INTERNAL_ERROR', 'Could not save resume');
    }
  });
});

seekerProfileRouter.delete('/seeker/resume', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const profile = await prisma.jobSeekerProfile.findUnique({
    where: { userId },
    select: { currentResumeFile: { select: { id: true, storageKey: true } } },
  });

  if (!profile?.currentResumeFile) {
    res.status(204).send();
    return;
  }

  await prisma.jobSeekerProfile.update({
    where: { userId },
    data: { currentResumeFileId: null },
  });

  const referenced = await isResumeReferencedByApplications(profile.currentResumeFile.id);
  if (!referenced) {
    deleteFileIfExists(profile.currentResumeFile.storageKey);
    await prisma.userFile.delete({ where: { id: profile.currentResumeFile.id } }).catch(() => undefined);
  }

  res.status(204).send();
});
