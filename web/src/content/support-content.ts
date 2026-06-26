export type FaqItem = { id: string; question: string; answer: string };

export type LegalSection = { id: string; title: string; paragraphs: string[] };

export const supportMeta = {
  lastUpdated: "15 June 2026",
  contactEmail: "hello@huntflow.app",
  contactResponseTime: "We aim to reply within 2 business days.",
};

export const contactPage = {
  badge: "Support",
  title: "Contact us",
  subtitle:
    "Questions about huntFlow, your account, or how the product works? Send us a message and we will get back to you.",
  channels: [
    {
      title: "Email",
      description: "Best for account help, feedback, and partnership enquiries.",
      value: supportMeta.contactEmail,
      href: `mailto:${supportMeta.contactEmail}`,
    },
    {
      title: "Job seekers",
      description: "Help with applications, profiles, tags, and your pipeline dashboard.",
      value: "Use the in-app Messages tab on each board application.",
      href: "/dashboard/seeker",
    },
    {
      title: "Employers",
      description: "Questions about postings, applicants, and company profile.",
      value: "Visit your employer dashboard applications inbox.",
      href: "/dashboard/employer/applications",
    },
  ],
};

export const faqPage = {
  badge: "Help",
  title: "Frequently asked questions",
  subtitle: "Quick answers about huntFlow and how to get the most from your account.",
};

export const faqItems: FaqItem[] = [
  {
    id: "what-is",
    question: "What is huntFlow?",
    answer:
      "huntFlow helps job seekers track every application in one pipeline — board applications and off-platform roles — with status history, tags, interviews, reminders, and messages. Employers can publish roles on the same board and review applicants.",
  },
  {
    id: "accounts",
    question: "Can I have both a job seeker and employer account?",
    answer:
      "Each email maps to one account with one role. If you need both experiences, use separate email addresses.",
  },
  {
    id: "apply",
    question: "How do I apply to a job on the board?",
    answer:
      "Open a listing, click Apply with huntFlow, and sign in as a job seeker. You can add an optional cover letter; your profile and resume (if uploaded) are shared with the employer.",
  },
  {
    id: "manual",
    question: "Can I track applications I submitted outside huntFlow?",
    answer:
      "Yes. From your seeker dashboard, choose Add application to log company, role, notes, and a source link. Manual entries sit alongside board applications in the same list.",
  },
  {
    id: "tags",
    question: "How do tags and filters work?",
    answer:
      "Add tags such as Remote, Referral, or Priority on any application. On your applications list, filter by tag, status, source (board vs manual), or search by company and role.",
  },
  {
    id: "schedule",
    question: "How do interviews and reminders work?",
    answer:
      "On each application detail page you can schedule interview rounds and follow-up reminders. Your dashboard Upcoming card shows what is next. When a reminder is due or an interview start time arrives, you get an in-app bell alert (if enabled in Settings). Email alerts may be added later.",
  },
  {
    id: "messages",
    question: "How do application messages and notifications work?",
    answer:
      "Each board application has its own message thread between you and the employer. In-app notifications alert you to new messages and status changes while you are using huntFlow.",
  },
  {
    id: "demo",
    question: "What is the demo data?",
    answer:
      "Development and demo environments include seeded accounts at @demo.huntflow.app (password Demo1234!) with sample companies, applications, and messages so you can explore the product.",
  },
  {
    id: "delete",
    question: "How do I delete my account?",
    answer:
      "Self-service account deletion is not available yet. Use the contact form or email hello@huntflow.app with your request and we will process it.",
  },
];

export const privacyPage = {
  badge: "Legal",
  title: "Privacy policy",
  subtitle: "How huntFlow collects, uses, and protects personal information.",
};

export const privacySections: LegalSection[] = [
  {
    id: "intro",
    title: "Overview",
    paragraphs: [
      "This policy explains what personal data huntFlow processes when you create an account, use the job board, track applications, or contact us.",
      "huntFlow is operated for job seekers and employers. This document is provided for transparency and is not legal advice.",
    ],
  },
  {
    id: "collect",
    title: "Data we collect",
    paragraphs: [
      "Account data: email, name, password (stored hashed), and role (job seeker or employer).",
      "Profile and application data: seeker headlines, bios, resumes, cover letters, application notes, tags, interview and reminder details, and messages you send in application threads.",
      "Employer data: company profile, job listings, and pipeline actions on applicants.",
      "Contact form: name, email, subject, and message when you write to us.",
      "Technical data: basic server logs and hashed IP addresses for abuse prevention on public forms.",
    ],
  },
  {
    id: "use",
    title: "How we use data",
    paragraphs: [
      "We use account data to authenticate you and show the correct dashboard.",
      "Application content is displayed to you and, for board applications, to the relevant employer. Messages are visible to participants in that application thread.",
      "Contact submissions are stored so our team can respond and maintain a support record.",
      "We do not sell personal data.",
    ],
  },
  {
    id: "retention",
    title: "Retention and security",
    paragraphs: [
      "We retain account and application data while your account is active and as needed for legitimate business or legal purposes.",
      "Uploaded files are stored on application infrastructure with access limited to authorized processes.",
      "You can update your seeker profile and resume from Settings at any time.",
    ],
  },
  {
    id: "rights",
    title: "Your choices",
    paragraphs: [
      "You may request access, correction, or deletion of your data by contacting hello@huntflow.app.",
      "You can opt out of non-essential employer notification emails from employer Settings where those controls exist.",
    ],
  },
];

export const termsPage = {
  badge: "Legal",
  title: "Terms of service",
  subtitle: "Rules for using huntFlow as a job seeker or employer.",
};

export const termsSections: LegalSection[] = [
  {
    id: "acceptance",
    title: "Agreement",
    paragraphs: [
      "By creating an account or using huntFlow, you agree to these Terms and our Privacy Policy.",
      "If you do not agree, do not use the service.",
    ],
  },
  {
    id: "accounts",
    title: "Accounts",
    paragraphs: [
      "You must provide accurate registration information and keep your password secure.",
      "You are responsible for activity under your account. Notify us promptly if you suspect unauthorized access.",
    ],
  },
  {
    id: "content",
    title: "Your content",
    paragraphs: [
      "You retain ownership of content you submit (profiles, resumes, messages, job postings). You grant huntFlow a licence to host and display that content solely to operate the service.",
      "Do not upload unlawful, misleading, or harmful material.",
    ],
  },
  {
    id: "employers",
    title: "Employers",
    paragraphs: [
      "Employers are responsible for the accuracy of job listings and compliance with employment laws in their jurisdictions.",
      "huntFlow does not guarantee hiring outcomes and is not a party to agreements between seekers and employers.",
    ],
  },
  {
    id: "liability",
    title: "Disclaimer and liability",
    paragraphs: [
      "The service is provided on an as-available basis. Features may change as huntFlow evolves.",
      "To the extent permitted by law, huntFlow’s liability is limited to the amount you paid for the service in the past twelve months (typically zero on the free tier).",
    ],
  },
];

export const legalCounselNote =
  "This document is provided for transparency; have qualified counsel review it before relying on it in production.";
