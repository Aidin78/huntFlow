import { Router } from 'express';
import { z } from 'zod';

import { listSeekerUpcoming } from '../lib/seekerUpcoming';
import { sendError } from '../lib/errors';
import { requireJobSeeker } from '../middleware/requireJobSeeker';

export const seekerUpcomingRouter = Router();

seekerUpcomingRouter.use('/seeker', requireJobSeeker);

seekerUpcomingRouter.get('/seeker/upcoming', async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    return;
  }

  const limitParsed = z.coerce.number().int().min(1).max(50).safeParse(req.query.limit);
  const horizonParsed = z.coerce.number().int().min(1).max(365).safeParse(req.query.horizonDays);

  try {
    const result = await listSeekerUpcoming(userId, {
      limit: limitParsed.success ? limitParsed.data : undefined,
      horizonDays: horizonParsed.success ? horizonParsed.data : undefined,
    });
    res.json(result);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    sendError(res, 500, 'INTERNAL_ERROR', 'Could not load upcoming schedule');
  }
});
