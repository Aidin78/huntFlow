import { prisma } from '@huntflow/db';
import { beforeEach, describe, expect, it } from 'vitest';

import { tryAcquireBackgroundJobRun } from '../lib/backgroundJobRun';
import { resetDatabase } from '../test/helpers';

describe('background job runs', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('acquires job key once', async () => {
    const first = await tryAcquireBackgroundJobRun('weekly_digest:test');
    const second = await tryAcquireBackgroundJobRun('weekly_digest:test');
    expect(first).toBe(true);
    expect(second).toBe(false);

    const row = await prisma.backgroundJobRun.findUnique({ where: { jobKey: 'weekly_digest:test' } });
    expect(row).not.toBeNull();
  });
});
