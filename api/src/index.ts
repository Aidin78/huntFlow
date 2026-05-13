import 'dotenv/config';
import cors from 'cors';
import express from 'express';

import { sendError } from './lib/errors';
import { authRouter } from './routes/auth';

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

app.get('/health', async (_req, res) => {
  try {
    // Avoid hard-failing dev startup when Prisma engines aren't downloaded yet.
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

const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});

