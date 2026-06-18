import { Router } from 'express';
import { z } from 'zod';

import { getPublicHomeData } from '../lib/publicHome';
import { sendError } from '../lib/errors';

export const publicHomeRouter = Router();

publicHomeRouter.get('/public/home', async (req, res) => {
  const limitParsed = z.coerce.number().int().min(1).max(12).safeParse(req.query.limit);
  const limit = limitParsed.success ? limitParsed.data : 3;

  try {
    const data = await getPublicHomeData(limit);
    res.json(data);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not load homepage data');
  }
});
