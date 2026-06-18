import { Router } from 'express';
import { z } from 'zod';

import { sendError } from '../lib/errors';
import {
  TAG_COLOR_PRESETS,
  createUserTag,
  deleteUserTag,
  listUserTags,
  updateUserTag,
} from '../lib/tags';
import { requireJobSeeker } from '../middleware/requireJobSeeker';

const tagIdSchema = z.string().uuid();
const tagColorSchema = z.enum(TAG_COLOR_PRESETS as unknown as [string, ...string[]]);

const createTagBodySchema = z.object({
  name: z.string().min(1).max(40),
  color: tagColorSchema.optional(),
});

const updateTagBodySchema = z.object({
  name: z.string().min(1).max(40).optional(),
  color: tagColorSchema.nullable().optional(),
});

export const seekerTagsRouter = Router();

seekerTagsRouter.use('/seeker', requireJobSeeker);

seekerTagsRouter.get('/seeker/tags', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  try {
    const result = await listUserTags(userId);
    if (!result.ok) {
      sendError(res, 500, 'INTERNAL_ERROR', 'Could not load tags');
      return;
    }
    res.json({ items: result.items });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not load tags');
  }
});

seekerTagsRouter.post('/seeker/tags', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const parsed = createTagBodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid request body', parsed.error.flatten());
    return;
  }

  try {
    const result = await createUserTag(userId, parsed.data);
    if (!result.ok) {
      const status = result.code === 'CONFLICT' ? 409 : 400;
      sendError(res, status, result.code, result.message ?? 'Could not create tag');
      return;
    }
    res.status(201).json({ tag: result.tag });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not create tag');
  }
});

seekerTagsRouter.patch('/seeker/tags/:tagId', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const tagIdParsed = tagIdSchema.safeParse(req.params.tagId);
  if (!tagIdParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid tag id');
    return;
  }

  const parsed = updateTagBodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid request body', parsed.error.flatten());
    return;
  }

  try {
    const result = await updateUserTag(tagIdParsed.data, userId, parsed.data);
    if (!result.ok) {
      const status =
        result.code === 'NOT_FOUND' ? 404 : result.code === 'CONFLICT' ? 409 : 400;
      sendError(res, status, result.code, result.message ?? 'Could not update tag');
      return;
    }
    res.json({ tag: result.tag });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not update tag');
  }
});

seekerTagsRouter.delete('/seeker/tags/:tagId', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const tagIdParsed = tagIdSchema.safeParse(req.params.tagId);
  if (!tagIdParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid tag id');
    return;
  }

  try {
    const result = await deleteUserTag(tagIdParsed.data, userId);
    if (!result.ok) {
      sendError(res, 404, result.code, 'Tag not found');
      return;
    }
    res.status(204).send();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not delete tag');
  }
});
