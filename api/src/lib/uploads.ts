import fs from 'fs';
import path from 'path';

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const ATTACHMENT_ALLOWED_MIME = new Set([
  ...ALLOWED_MIME,
  'image/png',
  'image/jpeg',
]);

const MAX_BYTES = 5 * 1024 * 1024;

export function getUploadDir(): string {
  const configured = process.env.UPLOAD_DIR?.trim();
  if (configured) {
    return path.isAbsolute(configured) ? configured : path.resolve(process.cwd(), configured);
  }
  return path.resolve(__dirname, '../../uploads');
}

export function ensureUploadDir(): void {
  const dir = getUploadDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function validateResumeFile(mimeType: string, sizeBytes: number): string | null {
  if (!ALLOWED_MIME.has(mimeType)) {
    return 'Only PDF or DOCX files are allowed';
  }
  if (sizeBytes > MAX_BYTES) {
    return 'File must be 5 MB or smaller';
  }
  return null;
}

export function validateAttachmentFile(mimeType: string, sizeBytes: number): string | null {
  if (!ATTACHMENT_ALLOWED_MIME.has(mimeType)) {
    return 'Only PDF, DOCX, PNG, or JPEG files are allowed';
  }
  if (sizeBytes > MAX_BYTES) {
    return 'File must be 5 MB or smaller';
  }
  return null;
}

export function resolveStoragePath(storageKey: string): string {
  const dir = getUploadDir();
  const resolved = path.resolve(dir, storageKey);
  if (!resolved.startsWith(dir + path.sep) && resolved !== dir) {
    throw new Error('Invalid storage key');
  }
  return resolved;
}

export function deleteFileIfExists(storageKey: string): void {
  try {
    const full = resolveStoragePath(storageKey);
    if (fs.existsSync(full)) {
      fs.unlinkSync(full);
    }
  } catch {
    // ignore cleanup errors
  }
}
