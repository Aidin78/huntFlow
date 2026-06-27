import path from 'path';
import dotenv from 'dotenv';

import { createApp } from './app';
import { startNotificationJobs } from './jobs/notificationJobs';

const repoRoot = path.resolve(__dirname, '../..');
dotenv.config({ path: path.join(repoRoot, '.env') });
dotenv.config({ path: path.join(repoRoot, '.env.local'), override: true });
dotenv.config({ override: true });

const app = createApp();
const port = Number(process.env.PORT ?? 4000);

const jobsEnabled = process.env.NOTIFICATION_JOBS_ENABLED !== 'false';
if (jobsEnabled) {
  startNotificationJobs();
}

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});
