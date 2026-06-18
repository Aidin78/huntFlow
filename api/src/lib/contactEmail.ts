export type ContactInquiryEmailPayload = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
};

function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.SUPPORT_INBOX_EMAIL?.trim());
}

export function isContactEmailEnabled(): boolean {
  return isEmailConfigured();
}

export async function sendContactNotification(
  inquiry: ContactInquiryEmailPayload,
): Promise<boolean> {
  if (!isEmailConfigured()) {
    return false;
  }

  const apiKey = process.env.RESEND_API_KEY!.trim();
  const to = process.env.SUPPORT_INBOX_EMAIL!.trim();
  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() || 'huntFlow <onboarding@resend.dev>';

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

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: inquiry.email,
        subject: `[huntFlow contact] ${inquiry.subject}`,
        text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      // eslint-disable-next-line no-console
      console.error('Resend contact notification failed:', res.status, body);
      return false;
    }

    return true;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Resend contact notification error:', e);
    return false;
  }
}
