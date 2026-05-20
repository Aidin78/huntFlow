import { prisma } from '@huntflow/db';

import { ensureApplicationThread } from './applicationThread';
import { sanitizePlainText } from './sanitize';

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

export async function listApplicationMessages(
  jobApplicationId: string,
  opts: { cursor?: string; limit?: number },
) {
  const threadId = await ensureApplicationThread(jobApplicationId);
  const limit = Math.min(opts.limit ?? DEFAULT_LIMIT, MAX_LIMIT);

  const rows = await prisma.applicationMessage.findMany({
    where: { threadId },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    take: limit + 1,
    ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    select: {
      id: true,
      body: true,
      createdAt: true,
      senderUserId: true,
      sender: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null;

  return {
    threadId,
    items: items.map((m) => ({
      id: m.id,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
      sender: m.sender,
    })),
    nextCursor,
    hasMore,
  };
}

export async function postApplicationMessage(
  jobApplicationId: string,
  senderUserId: string,
  bodyRaw: string,
) {
  const body = sanitizePlainText(bodyRaw, 4000);
  if (!body.length) {
    return { error: 'VALIDATION_ERROR' as const, message: 'Message cannot be empty' };
  }

  const threadId = await ensureApplicationThread(jobApplicationId);

  const message = await prisma.applicationMessage.create({
    data: { threadId, senderUserId, body },
    select: {
      id: true,
      body: true,
      createdAt: true,
      senderUserId: true,
      sender: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  return {
    item: {
      id: message.id,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
      sender: message.sender,
    },
  };
}
