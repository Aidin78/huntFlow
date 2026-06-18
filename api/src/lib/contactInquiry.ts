import { createHash } from 'node:crypto';

import { prisma } from '@huntflow/db';

import { sendContactNotification } from './contactEmail';
import { sanitizePlainText } from './sanitize';

export type CreateContactInquiryInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type ContactInquiryDto = {
  id: string;
  createdAt: string;
};

export function hashIpAddress(ip: string | undefined): string | null {
  if (!ip) return null;
  return createHash('sha256').update(ip).digest('hex');
}

export async function createContactInquiry(
  input: CreateContactInquiryInput,
  options: { ipHash?: string | null; userId?: string | null } = {},
): Promise<ContactInquiryDto> {
  const name = sanitizePlainText(input.name.trim(), 120);
  const email = sanitizePlainText(input.email.trim().toLowerCase(), 254);
  const subject = sanitizePlainText(input.subject.trim(), 200);
  const message = sanitizePlainText(input.message.trim(), 4000);

  const row = await prisma.supportInquiry.create({
    data: {
      name,
      email,
      subject,
      message,
      userId: options.userId ?? null,
      ipHash: options.ipHash ?? null,
    },
    select: { id: true, createdAt: true, name: true, email: true, subject: true, message: true },
  });

  const emailSent = await sendContactNotification({
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    createdAt: row.createdAt,
  });

  if (emailSent) {
    await prisma.supportInquiry.update({
      where: { id: row.id },
      data: { emailSent: true },
    });
  }

  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
  };
}
