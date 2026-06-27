import path from 'path';
import dotenv from 'dotenv';

import { startNotificationJobs, stopNotificationJobs } from './jobs/notificationJobs';

const repoRoot = path.resolve(__dirname, '../..');
dotenv.config({ path: path.join(repoRoot, '.env') });
dotenv.config({ path: path.join(repoRoot, '.env.local'), override: true });
dotenv.config({ override: true });

if (process.env.NOTIFICATION_JOBS_ENABLED === 'false') {
  // eslint-disable-next-line no-console
  console.warn('NOTIFICATION_JOBS_ENABLED=false — worker will not start notification timers.');
  process.exit(1);
}

startNotificationJobs();
// eslint-disable-next-line no-console
console.log('huntFlow notification worker running (schedule + weekly digest)');

function shutdown(): void {
  stopNotificationJobs();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
