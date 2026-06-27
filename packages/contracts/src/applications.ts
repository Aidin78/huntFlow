export type UserFileMeta = {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  downloadUrl?: string;
};

export type ApplicationContact = {
  id: string;
  applicationId: string;
  role: string | null;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  notes: string | null;
  createdAt: string;
};

export type ApplicationLink = {
  id: string;
  applicationId: string;
  label: string | null;
  url: string;
  createdAt: string;
};

export type ApplicationAttachment = {
  id: string;
  applicationId: string;
  filename: string;
  mimeType: string | null;
  sizeBytes: number | null;
  notes: string | null;
  createdAt: string;
};
