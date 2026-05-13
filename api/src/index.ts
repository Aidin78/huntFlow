import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

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

const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});

