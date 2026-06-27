export type SendEmailInput = {
  to: string | string[];
  subject: string;
  text: string;
  replyTo?: string;
};

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function getNotificationFromEmail(): string {
  return (
    process.env.NOTIFICATION_FROM_EMAIL?.trim() ||
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    'huntFlow <onboarding@resend.dev>'
  );
}

export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  if (!isResendConfigured()) {
    return false;
  }

  const apiKey = process.env.RESEND_API_KEY!.trim();
  const to = Array.isArray(input.to) ? input.to : [input.to];

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getNotificationFromEmail(),
        to,
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
        subject: input.subject,
        text: input.text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      // eslint-disable-next-line no-console
      console.error('Resend email failed:', res.status, body);
      return false;
    }

    return true;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Resend email error:', e);
    return false;
  }
}

export function getWebOrigin(): string | null {
  const origin = process.env.WEB_ORIGIN?.trim();
  if (!origin) return null;
  return origin.replace(/\/$/, '');
}

export function absoluteAppUrl(path: string | null): string | null {
  if (!path) return null;
  const origin = getWebOrigin();
  if (!origin) return null;
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}
