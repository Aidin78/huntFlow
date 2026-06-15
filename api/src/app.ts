import cors from 'cors';
import express from 'express';

import { sendError } from './lib/errors';
import { authRouter } from './routes/auth';
import { employerApplicationsRouter } from './routes/employerApplications';
import { employerJobListingsRouter } from './routes/employerJobListings';
import { employerOverviewRouter } from './routes/employerOverview';
import { employerSettingsRouter } from './routes/employerSettings';
import { jobListingsRouter } from './routes/jobListings';
import { filesRouter } from './routes/files';
import { notificationsRouter } from './routes/notifications';
import { seekerApplicationsRouter } from './routes/seekerApplications';
import { seekerUpcomingRouter } from './routes/seekerUpcoming';
import { seekerProfileRouter } from './routes/seekerProfile';

export function createApp(): express.Express {
  const app = express();

  const webOrigin = process.env.WEB_ORIGIN;
  app.use(
    cors({
      origin: webOrigin === undefined || webOrigin === '' ? true : webOrigin,
      credentials: true,
    }),
  );
  app.use(express.json());

  app.use('/api/auth', authRouter);
  app.use('/api', jobListingsRouter);
  app.use('/api', employerJobListingsRouter);
  app.use('/api', employerOverviewRouter);
  app.use('/api', employerSettingsRouter);
  app.use('/api', employerApplicationsRouter);
  app.use('/api', seekerApplicationsRouter);
  app.use('/api', seekerUpcomingRouter);
  app.use('/api', seekerProfileRouter);
  app.use('/api', filesRouter);
  app.use('/api', notificationsRouter);

  app.get('/health', async (_req, res) => {
    try {
      const { prisma } = await import('@huntflow/db');
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({ ok: true, db: 'ok' });
    } catch {
      res.status(200).json({ ok: true, db: 'unavailable' });
    }
  });

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    // eslint-disable-next-line no-console
    console.error(err);
    sendError(res, 500, 'INTERNAL_ERROR', 'Unexpected error');
  });

  return app;
}
