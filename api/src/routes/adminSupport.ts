import { Router } from 'express';
import { z } from 'zod';

import {
  getSupportInquiry,
  listSupportInquiries,
  updateSupportInquiry,
} from '../lib/adminSupport';
import { sendError } from '../lib/errors';
import { requirePlatformAdmin } from '../middleware/requirePlatformAdmin';

const inquiryIdSchema = z.string().uuid();

const supportInquiryStatusSchema = z.enum(['OPEN', 'RESOLVED']);

const listQuerySchema = z.object({
  status: supportInquiryStatusSchema.optional(),
  q: z.string().max(200).optional(),
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

const patchBodySchema = z.object({
  status: supportInquiryStatusSchema.optional(),
  adminNotes: z.string().max(4000).nullable().optional(),
});

export const adminSupportRouter = Router();

adminSupportRouter.use('/admin/support-inquiries', requirePlatformAdmin);

adminSupportRouter.get('/admin/support-inquiries', async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid query', parsed.error.flatten());
    return;
  }

  try {
    const result = await listSupportInquiries(parsed.data);
    res.json(result);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not load support inquiries');
  }
});

adminSupportRouter.get('/admin/support-inquiries/:id', async (req, res) => {
  const idParsed = inquiryIdSchema.safeParse(req.params.id);
  if (!idParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid inquiry id');
    return;
  }

  try {
    const inquiry = await getSupportInquiry(idParsed.data);
    if (!inquiry) {
      sendError(res, 404, 'NOT_FOUND', 'Inquiry not found');
      return;
    }
    res.json({ inquiry });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not load inquiry');
  }
});

adminSupportRouter.patch('/admin/support-inquiries/:id', async (req, res) => {
  const idParsed = inquiryIdSchema.safeParse(req.params.id);
  if (!idParsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid inquiry id');
    return;
  }

  const parsed = patchBodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Invalid request body', parsed.error.flatten());
    return;
  }

  if (parsed.data.status === undefined && parsed.data.adminNotes === undefined) {
    sendError(res, 400, 'VALIDATION_ERROR', 'No fields to update');
    return;
  }

  try {
    const inquiry = await updateSupportInquiry(idParsed.data, parsed.data);
    if (!inquiry) {
      sendError(res, 404, 'NOT_FOUND', 'Inquiry not found');
      return;
    }
    res.json({ inquiry });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not update inquiry');
  }
});
