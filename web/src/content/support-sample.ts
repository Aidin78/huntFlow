export type FaqItem = { id: string; question: string; answer: string };

export type LegalSection = { id: string; title: string; paragraphs: string[] };

export const supportMeta = {
  lastUpdated: "20 May 2026",
  contactEmail: "hello@huntflow.app",
  contactResponseTime: "We aim to reply within 2 business days (sample).",
};

export const contactPage = {
  badge: "Support",
  title: "Contact us",
  subtitle:
    "Questions about huntFlow, your account, or demo data? This is a sample contact page — messages are not sent to a real inbox yet.",
  channels: [
    {
      title: "Email",
      description: "Best for account help, feedback, and partnership enquiries.",
      value: supportMeta.contactEmail,
      href: `mailto:${supportMeta.contactEmail}`,
    },
    {
      title: "Job seekers",
      description: "Help with applications, profiles, and your pipeline dashboard.",
      value: "Use the in-app Messages tab on each application.",
      href: "/dashboard/seeker",
    },
    {
      title: "Employers",
      description: "Questions about postings, applicants, and company profile.",
      value: "Visit your employer dashboard applications inbox.",
      href: "/dashboard/employer/applications",
    },
  ],
  formNote:
    "The form below is a UI preview only. Wire it to your support API or helpdesk when you go to production.",
};

export const faqPage = {
  badge: "Help",
  title: "Frequently asked questions",
  subtitle: "Quick answers about huntFlow today. Sample copy — update before launch.",
};

export const faqItems: FaqItem[] = [
  {
    id: "what-is",
    question: "What is huntFlow?",
    answer:
      "huntFlow helps job seekers track applications in one pipeline and lets employers publish roles and review applicants. Employer hiring tools are still expanding; job seeker workflows are the current focus.",
  },
  {
    id: "accounts",
    question: "Can I have both a job seeker and employer account?",
    answer:
      "Each email maps to one account with one role. If you need both experiences, use separate email addresses or switch roles only by registering again with a different address.",
  },
  {
    id: "apply",
    question: "How do I apply to a job on the board?",
    answer:
      "Open a listing, click Apply with huntFlow, and sign in as a job seeker. You can add an optional cover letter; your profile and resume (if uploaded) are shared with the employer.",
  },
  {
    id: "messages",
    question: "How do application messages work?",
    answer:
      "Each application has its own thread. Employers and seekers can read and reply from the application detail page. Messages refresh every few seconds while the tab is open — there is no email notification yet.",
  },
  {
    id: "demo",
    question: "Is the demo data real?",
    answer:
      "Seed data in development uses @demo.huntflow.app accounts (password Demo1234!). Marketing testimonials and some employer overview numbers are placeholders until live analytics ship.",
  },
  {
    id: "delete",
    question: "How do I delete my account?",
    answer:
      "Self-service account deletion is not built yet. Contact us at hello@huntflow.app and we will note your request (sample process).",
  },
];

export const privacyPage = {
  badge: "Legal",
  title: "Privacy policy",
  subtitle: "Sample privacy notice for huntFlow. Replace with counsel-reviewed text before production.",
};

export const privacySections: LegalSection[] = [
  {
    id: "intro",
    title: "Overview",
    paragraphs: [
      "This sample policy describes how huntFlow would handle personal data when the product is live. It is not legal advice.",
      "We collect account information (email, name, role), profile and application content you submit, and usage data needed to operate the service.",
    ],
  },
  {
    id: "use",
    title: "How we use data",
    paragraphs: [
      "Account data authenticates you and routes you to the correct dashboard (job seeker or employer).",
      "Application data — cover letters, messages, resumes — is shown to the employer for listings you apply to, and to you on your own pipeline.",
      "We do not sell personal data. Sample analytics may be added later in aggregated form.",
    ],
  },
  {
    id: "retention",
    title: "Retention",
    paragraphs: [
      "We keep application records while your account is active and as needed for audit or legal obligations.",
      "Uploaded files are stored on the application server in development; production should use encrypted storage with access controls.",
    ],
  },
  {
    id: "rights",
    title: "Your choices",
    paragraphs: [
      "You can update your seeker profile and resume from Settings. You can export or delete data once those features ship.",
      "For questions about this sample policy, email hello@huntflow.app.",
    ],
  },
];

export const termsPage = {
  badge: "Legal",
  title: "Terms of service",
  subtitle: "Sample terms for huntFlow. Have a lawyer review before public launch.",
};

export const termsSections: LegalSection[] = [
  {
    id: "acceptance",
    title: "Agreement",
    paragraphs: [
      "By creating an account or using huntFlow, you agree to these sample terms and our Privacy Policy.",
      "If you do not agree, do not use the service.",
    ],
  },
  {
    id: "accounts",
    title: "Accounts",
    paragraphs: [
      "You must provide accurate registration information and keep your password secure.",
      "You are responsible for activity under your account. Notify us if you suspect unauthorized access.",
    ],
  },
  {
    id: "content",
    title: "Your content",
    paragraphs: [
      "You retain ownership of content you upload (profiles, resumes, messages, job postings). You grant huntFlow a licence to host and display that content to provide the service.",
      "Do not upload unlawful, misleading, or harmful material.",
    ],
  },
  {
    id: "employers",
    title: "Employers",
    paragraphs: [
      "Employers are responsible for the accuracy of job listings and compliance with employment laws in their jurisdictions.",
      "huntFlow does not guarantee hiring outcomes and is not a party to employment agreements between seekers and employers.",
    ],
  },
  {
    id: "liability",
    title: "Disclaimer",
    paragraphs: [
      "The service is provided as-is during development. Sample data and features may change without notice.",
      "To the extent permitted by law, huntFlow’s liability is limited to the amount you paid us in the past twelve months (typically zero during beta).",
    ],
  },
];
