import { sendEmail } from './email';

export type ContactInquiryEmailPayload = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
};

export function isContactEmailEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.SUPPORT_INBOX_EMAIL?.trim());
}

export async function sendContactNotification(
  inquiry: ContactInquiryEmailPayload,
): Promise<boolean> {
  const to = process.env.SUPPORT_INBOX_EMAIL?.trim();
  if (!to) {
    return false;
  }

  const text = [
    `New contact form submission`,
    ``,
    `From: ${inquiry.name} <${inquiry.email}>`,
    `Subject: ${inquiry.subject}`,
    `Inquiry ID: ${inquiry.id}`,
    `Received: ${inquiry.createdAt.toISOString()}`,
    ``,
    inquiry.message,
  ].join('\n');

  return sendEmail({
    to,
    replyTo: inquiry.email,
    subject: `[huntFlow contact] ${inquiry.subject}`,
    text,
  });
}
